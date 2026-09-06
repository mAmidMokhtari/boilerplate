import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../components/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Blocks/EmptyState",
  component: EmptyState,
  args: {
    title: "No posts yet",
    description: "Create the first post to see it listed here.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { action: <Button>New post</Button> },
};
