import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "IssueSnap",
  version: "0.1.0",
  description: "Turn the current page into an editable, privacy-first GitHub issue draft.",
  action: {
    default_popup: "index.html",
    default_title: "IssueSnap"
  },
  permissions: ["activeTab", "clipboardWrite", "scripting", "storage"]
});
