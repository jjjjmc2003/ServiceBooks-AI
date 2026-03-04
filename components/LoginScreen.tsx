"use client";

interface Props {
  username: string;
  password: string;
  error: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
}

export function LoginScreen({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-32px_rgba(15,23,42,0.45)] overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300 mb-3">EMfire Brands</p>
            <h1 className="text-3xl font-semibold leading-tight">Restaurant Finance Workspace</h1>
            <p className="text-sm text-slate-300 mt-3">
              Multi-brand accounting operations for Mighty Quinn&apos;s BBQ and Sugar Wing.
            </p>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p>Dummy credentials for demo access:</p>
            <p>
              Username: <span className="font-mono text-slate-100">demo_user</span>
            </p>
            <p>
              Password: <span className="font-mono text-slate-100">demo_pass</span>
            </p>
          </div>
        </div>

        <div className="p-8">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Secure Sign In</p>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your demo username and password to access the software.
          </p>

          <div className="mt-6 space-y-3">
            <input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLogin();
            }}
            placeholder="Username"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLogin();
            }}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <button
            onClick={onLogin}
            disabled={!username.trim() || !password.trim()}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Enter Workspace
          </button>
          <p className="md:hidden text-xs text-slate-500 pt-1">
            Demo login: <span className="font-mono">demo_user</span> /{" "}
            <span className="font-mono">demo_pass</span>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
