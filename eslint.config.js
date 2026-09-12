import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // These exports are intentional module APIs (hooks, context selectors,
      // styling helpers, and the toast helper) and are safe to keep alongside
      // their related component/provider.
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "CAREER_STATUS_CONFIG",
            "badgeVariants",
            "buttonVariants",
            "navigationMenuTriggerStyle",
            "toggleVariants",
            "toast",
            "useActiveStudentsInput",
            "useAdminSidebar",
            "useAlumni",
            "useLoggedInDeveloper",
            "useSelectedAlumni",
            "useLoggedInStudent",
            "useLoggedInAdmin",
            "useTheme",
            "useAlumniData",
            "useStudentAccounts",
            "getRemainingDays",
            "useDosen",
            "useInsightDashboard",
            "useFormField",
            "useSidebar",
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
