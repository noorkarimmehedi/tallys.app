import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const GoogleButton = React.forwardRef<HTMLButtonElement, GoogleButtonProps>(
  ({ className, isLoading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-md border bg-white px-6 py-5 text-base shadow-sm transition-all hover:bg-gray-50",
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-5 w-5 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 48 48"
          >
            <defs>
              <path
                id="a"
                d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
              />
            </defs>
            <clipPath id="b">
              <use xlinkHref="#a" overflow="visible" />
            </clipPath>
            <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
            <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
            <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
            <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
          </svg>
        )}
        <span className="text-sm font-medium text-gray-900">
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </span>
      </Button>
    );
  }
);

GoogleButton.displayName = "GoogleButton";

export { GoogleButton };