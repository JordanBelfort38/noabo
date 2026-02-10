"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, User, Lock, Trash2 } from "lucide-react";

import { updateProfileSchema, changePasswordSchema, type UpdateProfileInput, type ChangePasswordInput } from "@/lib/validations";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  emailVerified: string | null;
}

function ProfileContent() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = passwordForm.watch("newPassword", "");

  useEffect(() => {
    if (profile?.name) {
      profileForm.reset({ name: profile.name });
    }
  }, [profile, profileForm]);

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setProfileError("Erreur lors de la mise à jour du profil.");
        return;
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      setProfileSuccess("Profil mis à jour avec succès.");
      await updateSession({ name: data.name });
    } catch {
      setProfileError("Erreur de connexion.");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        if (body.error === "Current password is incorrect") {
          setPasswordError("Le mot de passe actuel est incorrect.");
        } else if (body.error === "Cannot change password for OAuth accounts") {
          setPasswordError("Impossible de changer le mot de passe pour les comptes OAuth.");
        } else if (res.status === 429) {
          setPasswordError("Trop de tentatives. Veuillez réessayer plus tard.");
        } else {
          setPasswordError("Erreur lors du changement de mot de passe.");
        }
        return;
      }

      setPasswordSuccess("Mot de passe modifié avec succès.");
      passwordForm.reset();
    } catch {
      setPasswordError("Erreur de connexion.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const res = await fetch("/api/auth/profile", { method: "DELETE" });

      if (res.ok) {
        await signOut({ callbackUrl: "/login" });
      }
    } catch {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Mon profil</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gérez vos informations personnelles et vos paramètres de sécurité
          </p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
                <CardDescription>Modifiez votre nom et consultez vos informations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">E-mail</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{profile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Membre depuis</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">E-mail vérifié</span>
                  <span className={profile?.emailVerified ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
                    {profile?.emailVerified ? "Oui" : "Non"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              {profileSuccess && (
                <Alert variant="success">
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="profile-name">Nom</Label>
                <Input
                  id="profile-name"
                  placeholder="Votre nom"
                  aria-invalid={!!profileForm.formState.errors.name}
                  {...profileForm.register("name")}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
              {passwordSuccess && (
                <Alert variant="success">
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Votre mot de passe actuel"
                    autoComplete="current-password"
                    aria-invalid={!!passwordForm.formState.errors.currentPassword}
                    {...passwordForm.register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    aria-label={showCurrentPassword ? "Masquer" : "Afficher"}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Votre nouveau mot de passe"
                    autoComplete="new-password"
                    aria-invalid={!!passwordForm.formState.errors.newPassword}
                    {...passwordForm.register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    aria-label={showNewPassword ? "Masquer" : "Afficher"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
                <PasswordStrengthIndicator password={newPassword ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Confirmez votre nouveau mot de passe"
                  autoComplete="new-password"
                  aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Modification en cours...
                  </>
                ) : (
                  "Changer le mot de passe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-600 dark:text-red-400">Zone de danger</CardTitle>
                <CardDescription>Actions irréversibles sur votre compte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              La suppression de votre compte est définitive. Toutes vos données, abonnements
              détectés et historique seront supprimés de manière irréversible.
            </p>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent onClose={() => setDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Supprimer votre compte ?</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Toutes vos données seront définitivement supprimées,
                y compris vos abonnements détectés, vos connexions bancaires et votre historique.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Oui, supprimer mon compte"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
