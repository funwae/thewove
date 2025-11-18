import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectApi, fileApi } from '../lib/api';
import { Editor } from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';

export function EditorPage() {
  const { username, projectSlug } = useParams<{ username: string; projectSlug: string }>();
  const { activeFile, files, updateFile, openFile } = useEditorStore();

  const { data: project } = useQuery({
    queryKey: ['project', username, projectSlug],
    queryFn: async () => {
      const response = await projectApi.get(username!, projectSlug!);
      return response.data.data;
    },
    enabled: !!username && !!projectSlug,
  });

  const { data: projectFiles } = useQuery({
    queryKey: ['projectFiles', project?.id],
    queryFn: async () => {
      const response = await fileApi.list(project!.id);
      return response.data.data;
    },
    enabled: !!project?.id,
  });

  const currentFile = activeFile ? files.get(activeFile) : null;

  const handleFileClick = async (filePath: string) => {
    if (!project?.id) return;

    // Check if file is already open
    if (files.has(filePath)) {
      useEditorStore.getState().setActiveFile(filePath);
      return;
    }

    // Fetch file content
    try {
      const response = await fileApi.get(project.id, filePath);
      const content = response.data.data.content;
      const language = getLanguageFromPath(filePath);
      openFile(filePath, content, language);
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile, value);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-2">
        <h1 className="text-lg font-semibold">{project?.name}</h1>
      </div>

      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 border-r p-4 overflow-auto">
          <h2 className="font-semibold mb-2">Files</h2>
          {projectFiles && projectFiles.length > 0 ? (
            <ul className="space-y-1">
              {projectFiles.map((file: any) => (
                <li key={file.id}>
                  <button
                    onClick={() => handleFileClick(file.file_path)}
                    className={`text-sm hover:bg-accent w-full text-left px-2 py-1 rounded ${
                      activeFile === file.file_path ? 'bg-accent' : ''
                    }`}
                  >
                    {file.file_path}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No files</p>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1">
          {currentFile ? (
            <Editor
              height="100%"
              language={currentFile.language}
              value={currentFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                rulers: [80],
                wordWrap: 'on',
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
  };
  return languageMap[ext || ''] || 'plaintext';
}
