type GitTreeEntry = {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string;
};

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${required("GITHUB_TOKEN")}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

function repoBase() {
  const owner = required("GITHUB_OWNER");
  const repo = required("GITHUB_REPO");
  return `https://api.github.com/repos/${owner}/${repo}`;
}

async function gh<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 400)}`);
  }
  return (await res.json()) as T;
}

async function createBlob(contentBase64: string): Promise<string> {
  const url = `${repoBase()}/git/blobs`;
  const json = await gh<{ sha: string }>(url, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({ content: contentBase64, encoding: "base64" }),
  });
  return json.sha;
}

export async function commitFilesToGitHub(params: {
  message: string;
  files: Array<{ path: string; contentBase64: string }>;
}): Promise<{ commitSha: string }> {
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const base = repoBase();

  const ref = await gh<{ object: { sha: string } }>(`${base}/git/ref/heads/${branch}`, {
    headers: ghHeaders(),
  });
  const parentSha = ref.object.sha;

  const parentCommit = await gh<{ tree: { sha: string } }>(`${base}/git/commits/${parentSha}`, {
    headers: ghHeaders(),
  });
  const baseTree = parentCommit.tree.sha;

  const tree: GitTreeEntry[] = [];
  for (const f of params.files) {
    const blobSha = await createBlob(f.contentBase64);
    tree.push({
      path: f.path.replace(/^\/+/, ""),
      mode: "100644",
      type: "blob",
      sha: blobSha,
    });
  }

  const newTree = await gh<{ sha: string }>(`${base}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });

  const commit = await gh<{ sha: string }>(`${base}/git/commits`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: params.message,
      tree: newTree.sha,
      parents: [parentSha],
    }),
  });

  await gh(`${base}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers: ghHeaders(),
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { commitSha: commit.sha };
}
