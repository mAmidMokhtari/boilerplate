import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: "Color scheme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
    direction: {
      description: "Text direction",
      toolbar: { icon: "transfer", items: ["ltr", "rtl"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light", direction: "ltr" },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as string;
      const direction = context.globals.direction as "ltr" | "rtl";
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.setAttribute("dir", direction);
      return (
        <div dir={direction} className="min-h-screen bg-background p-6 text-foreground">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
