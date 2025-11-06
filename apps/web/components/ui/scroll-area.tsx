/**
 * Scroll Area Component - Stub Implementation
 *
 * This is a temporary stub for Phase 4 dashboard features.
 * Real implementation will use @radix-ui/react-scroll-area
 * when Phase 4 is developed.
 */

import * as React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{ overflowY: "auto" }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
