"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, Sparkles } from "lucide-react";

interface AdminLoginProps {
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both Username and Password.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const res = await onLogin(username.trim(), password);
      if (!res.success) {
        setError(res.error || "Invalid Username or Password.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate. Please check your credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("pehalwan@123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center p-4 selection:bg-terracotta-500 selection:text-white relative">
      {/* Background Ambience */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#161514 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md bg-sand-50 border border-sand-300 rounded-4xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top Return Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-700/80 hover:text-terracotta-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Website</span>
          </Link>
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-charcoal-900 text-saffron-400 px-2.5 py-0.5 rounded-full">
            Restricted Access
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-charcoal-900 text-terracotta-500 flex items-center justify-center shadow-lg border-2 border-terracotta-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Pehalwan <span className="text-terracotta-500">Console.</span>
          </h1>
          <p className="text-xs text-charcoal-700/75 max-w-xs mx-auto">
            Authorized management portal for dishes, live orders, prices and customer bookings.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-2xl flex items-center gap-2.5 text-xs text-red-800 font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin Username or Email"
            required
            placeholder="admin or admin@pehalwankarahi.com"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-semibold text-charcoal-900 focus:outline-none focus:border-terracotta-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-700/60 hover:text-charcoal-900 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-3.5 mt-2 shadow-glow"
            icon={<Lock className="w-4 h-4" />}
          >
            Authenticate &amp; Enter Console
          </Button>
        </form>

        {/* Owner Credentials Quick Fill Badge */}
        <div className="p-3 bg-sand-100 rounded-2xl border border-sand-200/90 text-center space-y-1.5">
          <p className="text-[11px] font-bold text-charcoal-800 flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-saffron-500" />
            <span>Default Master Credentials</span>
          </p>
          <p className="text-[11px] text-charcoal-700/70 font-mono">
            Username: <strong className="text-charcoal-900">admin</strong> • Pass:{" "}
            <strong className="text-charcoal-900">pehalwan@123</strong>
          </p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-extrabold text-terracotta-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Click to Auto-fill Demo Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
