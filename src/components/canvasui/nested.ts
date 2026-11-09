//chrome's capture drops or misplaces live <canvas> kids (156 thru 159 at least),
//so they get hidden from it and painted underneath by hand. anything with a
//background between the page and one of those canvases would cover it - tag it
//data-canvasui-clear

type PaintableCanvas = HTMLCanvasElement & {
  requestPaint?: () => void;
  updateElementGeometry?: (element: Element) => void;
};

type ElementImageContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number) => unknown;
};

const STYLE_ID = "canvasui-nested";

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent =
    "[data-canvasui-content] canvas{opacity:0!important}" +
    "[data-canvasui-content] [data-canvasui-clear]{background:transparent!important}";
  document.head.appendChild(style);
}

//first real background above the effect, the capture has none of its own now
function pageBackground(source: HTMLElement): string | null {
  for (let el = source.parentElement; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return bg;
  }
  return null;
}

function paintNested(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  content: HTMLElement,
  box: DOMRect,
  scale: number,
) {
  if (!canvas.width || !canvas.height) return;
  const r = canvas.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return;
  if (r.right < box.left || r.left > box.right || r.bottom < box.top || r.top > box.bottom) return;
  if (getComputedStyle(canvas).visibility === "hidden") return;
  let alpha = 1;
  const clips: Array<[DOMRect, number[]]> = [];
  for (let el = canvas.parentElement; el && el !== content; el = el.parentElement) {
    const cs = getComputedStyle(el);
    alpha *= parseFloat(cs.opacity);
    if (alpha < 0.002) return;
    if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
      const radii = [
        cs.borderTopLeftRadius,
        cs.borderTopRightRadius,
        cs.borderBottomRightRadius,
        cs.borderBottomLeftRadius,
      ].map((v) => (parseFloat(v) || 0) * scale);
      clips.push([el.getBoundingClientRect(), radii]);
    }
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const [er, radii] of clips) {
    ctx.beginPath();
    ctx.roundRect((er.left - box.left) * scale, (er.top - box.top) * scale, er.width * scale, er.height * scale, radii);
    ctx.clip();
  }
  ctx.drawImage(
    canvas,
    (r.left - box.left) * scale,
    (r.top - box.top) * scale,
    r.width * scale,
    r.height * scale,
  );
  ctx.restore();
}

//bg, then live canvases, then the page on top so overlays stay on top
export function paintCapture(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  content: HTMLElement,
) {
  const c = ctx as ElementImageContext;
  ctx.reset();
  const box = source.getBoundingClientRect();
  const scale = source.width / Math.max(box.width, 1);
  const bg = pageBackground(source);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, source.width, source.height);
  }
  for (const canvas of Array.from(content.getElementsByTagName("canvas"))) {
    try {
      paintNested(ctx, canvas, content, box, scale);
    } catch {}
  }
  c.drawElementImage!(content, 0, 0);
  //or every click and wheel dies at the canvas
  (source as PaintableCanvas).updateElementGeometry?.(content);
}

//shaders animate without touching the dom, so keep repainting while one's on screen
export function watchNested(source: HTMLCanvasElement, content: HTMLElement) {
  ensureStyle();
  const paintable = source as PaintableCanvas;
  const visible = new Set<Element>();
  const observed = new Set<Element>();
  let raf = 0;

  const tick = () => {
    raf = 0;
    if (!visible.size) return;
    paintable.requestPaint?.();
    raf = requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      if (visible.size && !raf) raf = requestAnimationFrame(tick);
    },
    { root: content },
  );

  const sync = () => {
    const now = new Set<Element>(Array.from(content.getElementsByTagName("canvas")));
    for (const el of now) {
      if (observed.has(el)) continue;
      observed.add(el);
      io.observe(el);
    }
    for (const el of observed) {
      if (now.has(el)) continue;
      observed.delete(el);
      visible.delete(el);
      io.unobserve(el);
    }
  };

  sync();
  const mo = new MutationObserver(sync);
  mo.observe(content, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}
