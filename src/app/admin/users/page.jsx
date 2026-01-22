"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  // Password hasher
  const [hashInput, setHashInput] = useState("");
  const [hashedPassword, setHashedPassword] = useState("");
  const [hashing, setHashing] = useState(false);

  // Change password form
  const [changingPasswordFor, setChangingPasswordFor] = useState(null);
  const [changePassword, setChangePassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setNewUsername("");
      setNewPassword("");
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleChangePassword(userId) {
    if (!changePassword) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: changePassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setChangingPasswordFor(null);
      setChangePassword("");
      alert("Password changed successfully!");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleHashPassword() {
    if (!hashInput) return;
    setHashing(true);

    try {
      const res = await fetch("/api/admin/hash-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: hashInput }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to hash password");
      }

      const data = await res.json();
      setHashedPassword(data.hash);
    } catch (e) {
      setError(e.message);
    } finally {
      setHashing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">&larr; Dashboard</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Admin Users</h1>
        <p className="text-muted-foreground">Create and manage admin accounts</p>
      </header>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Admin User */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin User</CardTitle>
          <CardDescription>Add a new admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium">
                  Username *
                </label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  placeholder="admin2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password *
                </label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Admin User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Users */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Admin Users ({users.length})</h2>
        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {user.username}
                        {users.length === 1 && (
                          <Badge variant="secondary">Only Admin</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChangingPasswordFor(
                            changingPasswordFor === user.id ? null : user.id
                          );
                          setChangePassword("");
                        }}
                      >
                        {changingPasswordFor === user.id ? "Cancel" : "Change Password"}
                      </Button>
                      {users.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {changingPasswordFor === user.id && (
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={changePassword}
                        onChange={(e) => setChangePassword(e.target.value)}
                        placeholder="New password (min 8 characters)"
                        minLength={8}
                      />
                      <Button
                        onClick={() => handleChangePassword(user.id)}
                        disabled={changePassword.length < 8}
                      >
                        Save
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No admin users found.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Password Hasher Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Password Hash Generator</CardTitle>
          <CardDescription>
            Generate a bcrypt hash for a password. You can use this to manually insert
            users into the database or update passwords directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter password to hash"
              className="flex-1"
            />
            <Button onClick={handleHashPassword} disabled={hashing || !hashInput}>
              {hashing ? "Hashing..." : "Generate Hash"}
            </Button>
          </div>
          {hashedPassword && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Hashed Password (bcrypt):</label>
              <div className="relative">
                <code className="block p-3 bg-muted rounded text-xs break-all">
                  {hashedPassword}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => {
                    navigator.clipboard.writeText(hashedPassword);
                    alert("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can insert this directly into the database's <code>passwordHash</code> field.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Database Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Database Access</CardTitle>
          <CardDescription>
            For advanced user management, you can also use Prisma Studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Run this command in your terminal to open Prisma Studio:
          </p>
          <code className="bg-muted px-3 py-2 rounded text-sm block">
            npx prisma studio
          </code>
          <p className="text-sm text-muted-foreground mt-4">
            Then navigate to the <strong>AdminUser</strong> table to view/edit users directly.
            Use the hash generator above to create password hashes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
