export default {
  test: {
    // Linked worktrees are independent checkouts, not additional test suites.
    include: ['tests/**/*.test.{ts,mjs}'],
  },
};
