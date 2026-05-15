import { createFileRoute } from "@tanstack/react-router";
import PICUTool from "../components/PICUTool";

export const Route = createFileRoute("/")({
  component: PICUTool,
});
