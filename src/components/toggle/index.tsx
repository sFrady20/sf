import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import styles from "./style.module.css";
import { cn } from "@/utils/cn";

//the slider's binary cousin - a real checkbox underneath, css drives the
//visuals off its state, no js in the loop
export const Toggle = forwardRef<
  ElementRef<"div">,
  Omit<ComponentPropsWithoutRef<"input">, "type">
>((props, ref) => {
  const { className, style, ...inputProps } = props;

  return (
    <div ref={ref} style={style} className={cn(styles.container, className)}>
      <input {...inputProps} className={styles.input} type="checkbox" />
    </div>
  );
});
