"use client";

import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef } from "react";

//night-owl-ish, matches the site's existing code blocks. the editor surface
//stays dark in every theme, same as <Code>
const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#011627",
      color: "#d6deeb",
      fontSize: "13px",
      flex: "1",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono, ui-monospace, monospace)",
      lineHeight: "1.7",
      minHeight: "300px",
      maxHeight: "600px",
    },
    ".cm-content": { padding: "12px 0", caretColor: "#d6deeb" },
    ".cm-line": { padding: "0 16px" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#1d3b53",
    },
    ".cm-cursor": { borderLeftColor: "#d6deeb" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      border: "none",
      color: "#4b6479",
      paddingLeft: "8px",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#7c9cb5" },
    ".cm-placeholder": { color: "#5f7e97" },
  },
  { dark: true },
);

const editorHighlights = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.keyword, t.operatorKeyword], color: "#c792ea" },
    { tag: [t.string, t.special(t.string)], color: "#ecc48d" },
    { tag: t.number, color: "#f78c6c" },
    { tag: [t.bool, t.null, t.atom], color: "#ff5874" },
    { tag: [t.propertyName, t.attributeName], color: "#addb67" },
    { tag: [t.tagName, t.angleBracket], color: "#7fdbca" },
    { tag: t.comment, color: "#637777", fontStyle: "italic" },
    { tag: [t.punctuation, t.separator, t.bracket], color: "#d6deeb" },
    { tag: [t.definitionKeyword, t.modifier], color: "#c792ea" },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#82aaff" },
  ]),
);

export type EditorLanguage = "json" | "html";

//cheap + predictable, no statistical guessing
const detectLanguage = (text: string): EditorLanguage | null => {
  const trimmed = text.trimStart();
  if (!trimmed || text.length > 100_000) return null;
  if (/^[\[{]/.test(trimmed)) {
    try {
      JSON.parse(text);
      return "json";
    } catch (e) {
      return null;
    }
  }
  if (trimmed.startsWith("<")) return "html";
  return null;
};

const languageExtension = (lang: EditorLanguage | null): Extension =>
  lang === "json" ? json() : lang === "html" ? html() : [];

export function CodeEditor(props: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  //explicit hint wins, otherwise content detection decides
  language?: EditorLanguage;
  autoFocus?: boolean;
}) {
  const { value, onChange, readOnly, placeholder, language, autoFocus } =
    props;

  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());
  const placeholderCompartment = useRef(new Compartment());
  const activeLang = useRef<EditorLanguage | null>(null);

  //keep the latest callback without recreating the view
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const initialLang = language ?? detectLanguage(value);
    activeLang.current = initialLang;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          editorTheme,
          editorHighlights,
          langCompartment.current.of(languageExtension(initialLang)),
          lineNumbers(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          placeholderCompartment.current.of(cmPlaceholder(placeholder ?? "")),
          EditorState.readOnly.of(!!readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged)
              onChangeRef.current?.(update.state.doc.toString());
          }),
        ],
      }),
      parent: hostRef.current!,
    });
    viewRef.current = view;
    if (autoFocus) view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    //view is created once, everything dynamic goes through dispatches below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //push external value changes into the editor (output panel, clear button)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value)
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
  }, [value]);

  //the view is built once, so the placeholder needs reconfiguring too or it
  //stays stuck on whichever transform happened to mount first
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: placeholderCompartment.current.reconfigure(
        cmPlaceholder(placeholder ?? ""),
      ),
    });
  }, [placeholder]);

  //swap the language when the hint or the content's shape changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const next = language ?? detectLanguage(value);
    if (next === activeLang.current) return;
    activeLang.current = next;
    view.dispatch({
      effects: langCompartment.current.reconfigure(languageExtension(next)),
    });
  }, [language, value]);

  return <div ref={hostRef} className="flex-1 min-h-[300px] flex flex-col" />;
}
