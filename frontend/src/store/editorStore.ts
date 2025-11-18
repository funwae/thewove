import { create } from 'zustand';

interface File {
  path: string;
  content: string;
  language: string;
}

interface EditorState {
  files: Map<string, File>;
  activeFile: string | null;

  openFile: (path: string, content: string, language: string) => void;
  closeFile: (path: string) => void;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string | null) => void;
  getFile: (path: string) => File | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  files: new Map(),
  activeFile: null,

  openFile: (path, content, language) =>
    set((state) => {
      const files = new Map(state.files);
      files.set(path, { path, content, language });
      return { files, activeFile: path };
    }),

  closeFile: (path) =>
    set((state) => {
      const files = new Map(state.files);
      files.delete(path);
      const activeFile = state.activeFile === path ? null : state.activeFile;
      return { files, activeFile };
    }),

  updateFile: (path, content) =>
    set((state) => {
      const files = new Map(state.files);
      const file = files.get(path);
      if (file) {
        files.set(path, { ...file, content });
      }
      return { files };
    }),

  setActiveFile: (path) =>
    set({ activeFile: path }),

  getFile: (path) =>
    get().files.get(path),
}));
