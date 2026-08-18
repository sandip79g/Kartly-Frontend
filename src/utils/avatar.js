export function avatarUrlFor(user) {
  if (user?.avatar_url) return user.avatar_url;
  const name = user?.full_name || user?.username || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0EA5A8&color=FFFFFF&bold=true`;
}