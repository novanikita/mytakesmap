import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserMap } from "@/components/UserMap";
import { normalizeUsername, validateUsername } from "@/lib/validation";
import { LibraryItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UsernamePage({ params }: PageProps) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw);

  if (validateUsername(username)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!user) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.username === user.username;

  const items: LibraryItem[] = user.items.map((item) => ({
    id: item.id,
    type: item.type as LibraryItem["type"],
    title: item.title,
    year: item.year,
    director: item.director,
    coverUrl: item.coverUrl,
    description: item.description,
    x: item.x,
    y: item.y,
    watchedYear: item.watchedYear,
    color: item.color ?? undefined,
  }));

  return <UserMap username={user.username} isOwner={isOwner} items={items} />;
}
