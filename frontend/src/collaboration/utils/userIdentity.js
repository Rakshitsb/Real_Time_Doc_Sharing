const USER_COLORS = ["#14b8a6", "#6366f1", "#f97316", "#ec4899", "#22c55e", "#8b5cf6"];

const getUserColor = (value = "") => {
  const code = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return USER_COLORS[code % USER_COLORS.length];
};

const getCollaborationUser = (user) => {
  const name = user?.name || user?.email || "Collaborator";

  return {
    name,
    email: user?.email || "",
    color: getUserColor(user?.email || name),
  };
};

export { getCollaborationUser, getUserColor };
