import React, { useState } from "react";

export type Folder = {
  id: number;
  name: string;
  parentId: number | null;
  children?: Folder[];
};

interface FolderTreeProps {
  folders: Folder[];
  onSelect?: (folderId: number) => void;
}

// 階層構造に変換するヘルパー
function buildTree(folders: Folder[]): Folder[] {
  const map = new Map<number, Folder>();
  folders.forEach(f => map.set(f.id, { ...f, children: [] }));
  const roots: Folder[] = [];
  map.forEach(folder => {
    if (folder.parentId === null) {
      roots.push(folder);
    } else {
      const parent = map.get(folder.parentId);
      if (parent) parent.children!.push(folder);
    }
  });
  return roots;
}

const FolderTree: React.FC<FolderTreeProps> = ({ folders, onSelect }) => {
  const tree = buildTree(folders);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    if (onSelect) onSelect(id);
  };

  const renderTree = (nodes: Folder[]) => (
    <ul style={{ listStyle: "none", paddingLeft: 16 }}>
      {nodes.map(node => (
        <li key={node.id}>
          <span
            style={{
              cursor: "pointer",
              fontWeight: node.id === selectedId ? "bold" : "normal",
              background: node.id === selectedId ? "#e0f7fa" : "transparent",
              borderRadius: 4,
              padding: "2px 6px"
            }}
            onClick={() => handleSelect(node.id)}
          >
            {node.name}
          </span>
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return <div>{renderTree(tree)}</div>;
};

export default FolderTree;
