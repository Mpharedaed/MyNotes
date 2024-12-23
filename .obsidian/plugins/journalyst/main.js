/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => JournalystPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// views/SideBar.ts
var import_obsidian = require("obsidian");
var VIEW_TYPE_SIDE_BAR = "journalyst-side-bar-view";
var SideBarView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_SIDE_BAR;
  }
  getDisplayText() {
    return "Journalyst";
  }
  async onOpen() {
    this.rootContainer = this.containerEl.children[1];
    this.rootContainer.empty();
    this.addHeader();
    this.addJournalSections();
    this.registerEvent(
      this.app.vault.on("create", () => this.onFileChanged())
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.onFileChanged())
    );
    this.registerEvent(
      this.app.vault.on("modify", () => this.onFileChanged())
    );
    this.registerEvent(
      this.app.vault.on("rename", (item) => this.onFileChanged())
    );
  }
  onFileChanged() {
    this.rootContainer = this.containerEl.children[1];
    this.rootContainer.empty();
    this.addHeader();
    this.addJournalSections();
  }
  async onClose() {
  }
  addHeader() {
    this.rootContainer.createEl("h3", { text: "Journals" });
  }
  addJournalSections() {
    this.plugin.journals.forEach((journal) => {
      const journalSection = this.rootContainer.createEl("div");
      journalSection.addClass("journal-section");
      journalSection.createEl("h4", { text: journal.name });
      this.createHeatMap(journal, journalSection);
      const gotoButton = journalSection.createEl("button", { text: "Go to today" });
      gotoButton.addClass("journal-section-button");
      gotoButton.addEventListener("click", () => {
        this.goToDay(journal);
      });
    });
  }
  createHeatMap(journal, journalSection) {
    const heatMapWrapper = journalSection.createEl("div", { cls: "heat-map-wrapper" });
    const days = ["S", "M", "T", "W", "Th", "F", "S"];
    days.forEach((day) => {
      const dayEl = heatMapWrapper.createEl("span", { text: day });
      dayEl.addClass("heat-map-day-label");
    });
    const startOfMonthOffset = (0, import_obsidian.moment)().startOf("month").day();
    for (let i = 0; i < startOfMonthOffset; i++) {
      const day = heatMapWrapper.createEl("div", { cls: "heat-map-offset" });
    }
    const daysInMonth = (0, import_obsidian.moment)().daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      const day = heatMapWrapper.createEl("div", { cls: "heat-map-day", text: String(i) });
      const dayString = `${(0, import_obsidian.moment)().format("YYYY-MM")}-${String(i).padStart(2, "0")}.md`;
      day.addEventListener("click", () => {
        this.goToDay(journal, dayString);
      });
      const dayFile = this.plugin.app.vault.getAbstractFileByPath(journal.path + "/" + dayString);
      if (dayFile) {
        day.addClass("heat-map-day-exists");
      }
    }
  }
  async goToDay(journalFolder, date) {
    const dayString = date != null ? date : `${(0, import_obsidian.moment)().format("YYYY-MM")}-${(0, import_obsidian.moment)().format("DD")}.md`;
    const dayFile = journalFolder.children.find((file) => file.name === dayString);
    if (dayFile) {
      this.app.workspace.openLinkText(dayFile.path, "/", false);
    } else {
      const newFilePath = `${journalFolder.path}/${dayString}`;
      const newFileContents = `---
reviewed: false
---`;
      const file = await this.app.vault.create(newFilePath, newFileContents);
      this.app.workspace.openLinkText(file.path, "/", false);
    }
  }
};

// views/Settings.ts
var import_obsidian2 = require("obsidian");
var JournalystSettingsTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Journalyst home directory").setDesc("The directory where Journalyst will look for your journals.").addDropdown((dropdown) => {
      this.app.vault.getAllLoadedFiles().filter((file) => file instanceof import_obsidian2.TFolder).forEach((folder) => {
        dropdown.addOption(folder.path, folder.path);
      });
      dropdown.setValue(this.plugin.settings.rootDirectory).onChange(async (value) => {
        this.plugin.settings.rootDirectory = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// main.ts
var DEFAULT_SETTINGS = {
  rootDirectory: "/"
};
var JournalystPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.journals = [];
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new JournalystSettingsTab(this.app, this));
    const ribbonIconEl = this.addRibbonIcon("book-copy", "Go to Journalyst view", () => {
      this.activateView();
    });
    this.app.workspace.onLayoutReady(() => {
      const rootFolder = this.app.vault.getAbstractFileByPath(this.settings.rootDirectory);
      if (rootFolder instanceof import_obsidian3.TFolder === false) {
        return;
      }
      rootFolder.children.forEach((child) => {
        if (child instanceof import_obsidian3.TFolder === false) {
          return;
        }
        this.journals.push(child);
        this.addCommand({
          id: "create-journal-" + child.name,
          name: "Create new journal in " + child.name,
          callback: () => {
            const todaysDate = (0, import_obsidian3.moment)().format("YYYY-MM-DD");
            const newFileName = todaysDate + ".md";
            const fullPath = (0, import_obsidian3.normalizePath)(child.path + "/" + newFileName);
            this.app.vault.create(fullPath, "---\ntitle: " + todaysDate + "\n---\n");
          }
        });
      });
      this.registerView(
        VIEW_TYPE_SIDE_BAR,
        (leaf) => new SideBarView(leaf, this)
      );
    });
    this.registerEvent(
      this.app.vault.on("create", (item) => this.onItemChange())
    );
    this.registerEvent(
      this.app.vault.on("delete", (item) => this.onItemChange())
    );
    this.registerEvent(
      this.app.vault.on("rename", (item) => this.onItemChange())
    );
  }
  onunload() {
  }
  onItemChange() {
    const rootFolder = this.app.vault.getAbstractFileByPath(this.settings.rootDirectory);
    if (rootFolder instanceof import_obsidian3.TFolder === false) {
      return;
    }
    this.journals = [];
    rootFolder.children.forEach((child) => {
      if (child instanceof import_obsidian3.TFolder === false) {
        return;
      }
      this.journals.push(child);
      this.addCommand({
        id: "create-journal-" + child.name,
        name: "Create new journal in " + child.name,
        callback: () => {
          const todaysDate = (0, import_obsidian3.moment)().format("YYYY-MM-DD");
          const newFileName = todaysDate + ".md";
          const fullPath = (0, import_obsidian3.normalizePath)(child.path + "/" + newFileName);
          this.app.vault.create(fullPath, "---\ntitle: " + todaysDate + "\n---\n");
        }
      });
    });
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_SIDE_BAR);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_SIDE_BAR, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};


/* nosourcemap */