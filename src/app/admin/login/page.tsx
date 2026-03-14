"use client";

import { useState } from "react";
import { signIn, signOut, fetchUserAttributes, confirmSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Shield, ChevronLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNeedsNewPassword(true);
        setLoading(false);
        return;
      }

      if (isSignedIn) {
        await verifyAndRedirect();
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      if (!needsNewPassword) setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
      if (isSignedIn) {
        await verifyAndRedirect();
      }
    } catch (err: any) {
      setError(err.message || "Failed to set new password.");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndRedirect = async () => {
    try {
      const attrs = await fetchUserAttributes();
      const role = attrs["custom:role"];
      if (role !== "admin") {
        await signOut();
        setError("Access denied. This portal is for administrators only.");
        return;
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0007] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Site
      </Link>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-red-900/30 bg-[#12060a]/80 backdrop-blur-xl p-10 shadow-2xl space-y-8">
          {/* Badge */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-900/30 border border-red-700/40 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
              <p className="text-slate-500 text-sm">LesiBooking Internal Access</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {needsNewPassword ? (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div className="p-3 mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                This is your first time logging in (or your password was reset). Please set a permanent password to continue.
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait mt-2 shadow-lg shadow-red-900/40"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Shield className="w-4 h-4" /> Set Password & Login</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@lesibooking.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait mt-2 shadow-lg shadow-red-900/40"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <><Shield className="w-4 h-4" /> Sign In to Admin</>}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-700">
            Restricted access — authorised personnel only
          </p>
        </div>
      </div>
    </main>
  );
}
