export const Recent = () => {
  return (
    <div className="bg-background-light text-[#0d0e1b] dark:bg-background-dark dark:text-[#f8f8fc] font-['Inter',_sans-serif]">
      <div className="flex h-screen overflow-hidden">
        <aside className="z-20 flex w-64 flex-col justify-between border-r border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">edit_square</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="truncate text-base font-bold">Workspace Alpha</h1>
                <p className="text-xs font-medium text-[#4c4d9a] dark:text-[#a1a1c9]">Collaborative Team</p>
              </div>
            </div>

            <button
              className="hover-lift flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold tracking-wide text-white"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Create New</span>
            </button>

            <nav className="flex flex-col gap-1">
              <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#e7e7f3] px-3 py-2 text-primary dark:bg-primary/20">
                <span className="material-symbols-outlined">home</span>
                <p className="text-sm font-semibold">Home</p>
              </div>
              <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] transition-colors hover:bg-[#f0f0f7] dark:text-[#a1a1c9] dark:hover:bg-white/5">
                <span className="material-symbols-outlined">schedule</span>
                <p className="text-sm font-medium">Recent</p>
              </div>
              <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] transition-colors hover:bg-[#f0f0f7] dark:text-[#a1a1c9] dark:hover:bg-white/5">
                <span className="material-symbols-outlined">star</span>
                <p className="text-sm font-medium">Starred</p>
              </div>
              <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] transition-colors hover:bg-[#f0f0f7] dark:text-[#a1a1c9] dark:hover:bg-white/5">
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Shared</p>
              </div>
              <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] transition-colors hover:bg-[#f0f0f7] dark:text-[#a1a1c9] dark:hover:bg-white/5">
                <span className="material-symbols-outlined">delete</span>
                <p className="text-sm font-medium">Trash</p>
              </div>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-[#f8f8fc] p-3 dark:bg-[#1e1f3a]">
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span>Storage</span>
                <span>75%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#e7e7f3] dark:bg-[#2a2b4a]">
                <div className="h-full w-3/4 rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] transition-colors hover:bg-[#f0f0f7] dark:text-[#a1a1c9] dark:hover:bg-white/5">
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </div>
          </div>
        </aside>

        <main className="relative flex flex-1 flex-col overflow-y-auto">
          <div className="fixed right-6 top-6 z-50">
            <div className="flex min-w-[280px] items-center gap-3 rounded-xl border border-[#cfd0e7] bg-white p-4 shadow-xl dark:border-[#2a2b4a] dark:bg-[#1e1f3a]">
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined spinner-rotate text-primary">sync</span>
                <div className="dot-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500 dark:border-[#1e1f3a]"></div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold leading-none text-[#0d0e1b] dark:text-white">Syncing...</p>
                <p className="mt-1 text-xs text-[#4c4d9a] dark:text-[#a1a1c9]">
                  Updating your latest changes
                </p>
              </div>
              <button className="ml-auto text-[#cfd0e7] transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7e7f3] bg-background-light px-8 py-4 dark:border-[#2a2b4a] dark:bg-background-dark">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c4d9a] dark:text-[#a1a1c9]">
                  search
                </span>
                <div className="skeleton-shimmer h-10 w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7e7f3] text-[#0d0e1b] dark:bg-[#1e1f3a] dark:text-white"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7e7f3] text-[#0d0e1b] dark:bg-[#1e1f3a] dark:text-white"
                type="button"
              >
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-[#2a2b4a]">
                <img
                  className="h-full w-full object-cover"
                  data-alt="User profile avatar circle"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJwmj2W_WdqPvAvHcb3gxU5ARhPnXnDz-NocScpKaNW27AhzfE1BUGEG3t8nrmQmY3RlinjCLXclsrCVIyddEwdQ3gaY-fEaAvspJ1JTxXGDsgjfH1wtI0Y7YqRu6G6fy_LP0CeqtEMpLgj45oR5-Va7_Gl2-DKAbujS8qzc2-8Qn4QhoL3B-_EYcE-NDhuD-fjz3MxxjWKwK8ot-eIGlqdUNnVpxG8nXjKNeS_wt9A_kfWUTk6ahPCh6ngSlIBwl9RnjDWA2zCw"
                  alt="User profile avatar"
                />
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-black tracking-tight">Recent Documents</h2>
                <p className="text-[#4c4d9a] dark:text-[#a1a1c9]">Manage and edit your workspace files</p>
              </div>
              <div className="flex gap-2">
                <div className="skeleton-shimmer h-9 w-24 rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="skeleton-shimmer h-9 w-24 rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-3/4 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/2 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-2/3 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/3 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-4/5 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-2/5 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-1/2 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/4 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-3/5 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/3 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-3/4 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/2 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-2/3 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-1/3 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-[#e7e7f3] bg-white p-4 dark:border-[#2a2b4a] dark:bg-[#16172d]">
                <div className="skeleton-shimmer aspect-[4/3] w-full rounded-lg bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                <div className="flex flex-col gap-2">
                  <div className="skeleton-shimmer h-5 w-4/5 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                  <div className="skeleton-shimmer h-3 w-2/5 rounded bg-[#e7e7f3] dark:bg-[#1e1f3a]"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
