import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session!.user.id },
    data: { name: parsed.data.name },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await prisma.user.delete({
    where: { id: session!.user.id },
  });

  return NextResponse.json({ message: "Account deleted" });
}
