import React from 'react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161b22] retro-box p-6 max-w-3xl w-full my-8 max-h-[90vh] flex flex-col text-[#e6edf3]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#30363d] pb-3 mb-4 shrink-0">
          <div>
            <div className="font-mono-code text-[10px] text-[#38bdf8] font-bold uppercase">
              Deployment Manual
            </div>
            <h2 className="font-pixel text-sm sm:text-base text-[#f0f6fc]">
              GITHUB PAGES DEPLOYMENT INSTRUCTIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-mono-code text-sm font-bold bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#e6edf3] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 font-mono-code text-xs text-[#c9d1d9]">
          <div className="p-3 bg-[#0e4429] border border-[#238636] text-[#a7f3d0]">
            <strong>Static Architecture Verified:</strong> This application has no backend server or database, requires no external AI APIs, and runs 100% in the user's browser. Relative subpath asset routing (<code className="bg-[#0d1117] px-1 py-0.5 border border-[#238636]">base: './'</code>) is pre-configured in <code className="bg-[#0d1117] px-1 py-0.5 border border-[#238636]">vite.config.ts</code>.
          </div>

          {/* Step 1 */}
          <div className="p-4 bg-[#0d1117] border border-[#30363d]">
            <div className="font-bold text-sm text-[#f0f6fc] mb-1">
              Step 1: Export or Clone the Project
            </div>
            <p className="mb-2 leading-relaxed">
              Download or export the project files from AI Studio to your local computer. Ensure all source files, <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">package.json</code>, <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">vite.config.ts</code>, and <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">index.html</code> are preserved.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-[#0d1117] border border-[#30363d]">
            <div className="font-bold text-sm text-[#f0f6fc] mb-1">
              Step 2: Create a GitHub Repository
            </div>
            <p className="mb-2 leading-relaxed">
              Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-[#38bdf8] underline font-bold">github.com/new</a> and create a new public repository (e.g., <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">laws-of-exponents-reviewer</code>).
            </p>
            <p className="leading-relaxed">
              Push your code to the repository:
            </p>
            <pre className="bg-[#161b22] text-[#34d399] p-2.5 border border-[#30363d] rounded mt-2 text-[11px] overflow-x-auto">
{`git init
git add .
git commit -m "Initial commit of Laws of Exponents Reviewer"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main`}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-[#0d1117] border border-[#30363d]">
            <div className="font-bold text-sm text-[#f0f6fc] mb-1">
              Step 3: Option A — Automatic Deployment via GitHub Actions (Recommended)
            </div>
            <p className="mb-2 leading-relaxed">
              1. In your GitHub repository, navigate to <strong>Settings → Pages</strong>.
            </p>
            <p className="mb-2 leading-relaxed">
              2. Under <strong>Build and deployment → Source</strong>, select <strong>GitHub Actions</strong>.
            </p>
            <p className="mb-2 leading-relaxed">
              3. Create a workflow file at <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">.github/workflows/deploy.yml</code> with the following configuration:
            </p>
            <pre className="bg-[#161b22] text-[#f0f6fc] p-2.5 border border-[#30363d] rounded mt-2 text-[11px] overflow-x-auto">
{`name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build static site
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`}
            </pre>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-[#0d1117] border border-[#30363d]">
            <div className="font-bold text-sm text-[#f0f6fc] mb-1">
              Step 4: Option B — Manual Static Build (`dist` branch or gh-pages)
            </div>
            <p className="mb-2 leading-relaxed">
              Alternatively, build locally and publish the <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">dist</code> directory:
            </p>
            <pre className="bg-[#161b22] text-[#f0f6fc] p-2.5 border border-[#30363d] rounded mt-2 text-[11px] overflow-x-auto">
{`npm install
npm run build
npx gh-pages -d dist`}
            </pre>
            <p className="mt-2 text-[11px] text-[#8b949e]">
              In GitHub repository <strong>Settings → Pages</strong>, set branch to <code className="bg-[#21262d] px-1 py-0.5 border border-[#30363d]">gh-pages</code> (root).
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-[#0d1117] border border-[#30363d]">
            <div className="font-bold text-sm text-[#f0f6fc] mb-1">
              Step 5: Open Your Published Reviewer
            </div>
            <p className="leading-relaxed">
              Your site will be live at:
              <br />
              <strong className="text-[#34d399]">https://&lt;your-username&gt;.github.io/&lt;repo-name&gt;/</strong>
              <br />
              All mathematical fonts, KaTeX styles, and local question generators will run completely client-side in dark mode!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-[#30363d] flex justify-end shrink-0 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 font-pixel text-xs bg-[#21262d] text-[#e6edf3] retro-btn cursor-pointer"
          >
            CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
