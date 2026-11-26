export const brand = {
  name: "WareHub",
  description:
    "A clearer view of your inventory, orders, and suppliers — all in one place. WareHub helps your team keep every operation moving.",
};

export const navigationLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const statsAriaLabel = "WareHub at a glance";

export const navigationActions = {
  login: { label: "Login", href: "/login" },
  signup: { label: "Sign Up", href: "/signup" },
};

export const navigationLabels = {
  main: "Main navigation",
  openMenu: "Open menu",
  closeMenu: "Close menu",
};

export const heroContent = {
  eyebrow: "WAREHOUSE OPERATIONS, MADE SIMPLE",
  titlePrefix: "Manage Your Warehouse",
  titleHighlight: "Smarter",
  description:
    "Track stock, orders, and suppliers in one place. Give your team the clarity to move faster and keep every part of your operation in sync.",
  primaryAction: { label: "Get Started", href: "/signup" },
  secondaryAction: { label: "Login", href: "/login" },
  image: {
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85",
    alt: "Organized warehouse shelves and active logistics operations",
  },
  glassCard: {
    eyebrow: "YOUR WAREHOUSE, CONNECTED",
    title: "Everything in sync",
    description:
      "A shared view for the people, products, and processes behind every delivery.",
    points: ["Inventory at a glance", "Orders in motion", "Suppliers connected"],
  },
  scrollLabel: "Scroll to features",
  trustPoints: ["Real-time Stock", "Role-based Access", "Smart Reports"],
};

export const authContent = {
  kicker: "WAREHOUSE OPERATIONS, IN FOCUS",
  marketingTitle: "The clarity to keep work moving.",
  continueLabel: "Create a free account",
  termsLabel: "I agree to the Terms of Service and Privacy Policy",
  login: {
    title: "Welcome back",
    subtitle: "Sign in to continue to your WareHub workspace.",
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberLabel: "Remember me",
    forgotLabel: "Forgot password?",
    submitLabel: "Sign In",
    switchPrompt: "New to WareHub?",
    switchLabel: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start bringing your warehouse operations together.",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    emailLabel: "Work email",
    emailPlaceholder: "you@company.com",
    roleLabel: "I am joining as",
    rolePlaceholder: "Choose your role",
    roles: [
      { value: "sales", label: "Sales" },
      { value: "supplier", label: "Supplier" },
    ],
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your password",
    submitLabel: "Create Account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
  },
};

export const featuresSection = {
  eyebrow: "Everything in sync",
  title: "One clear view of your entire operation",
  subtitle:
    "The tools your team needs to keep inventory, orders, and suppliers moving together.",
};

export const features = [
  {
    icon: "Package",
    title: "Inventory Tracking",
    description:
      "See product quantities and warehouse stock levels at a glance, with a reliable view of what is available.",
  },
  {
    icon: "ArrowDownToLine",
    title: "Stock In/Out",
    description:
      "Keep a clear history of incoming and outgoing stock so every inventory movement is accounted for.",
  },
  {
    icon: "ShoppingCart",
    title: "Orders Management",
    description:
      "Follow customer orders from creation through fulfillment with statuses your whole team can understand.",
  },
  {
    icon: "Truck",
    title: "Supply Requests",
    description:
      "Coordinate supplier requests and reviews to help replenish products before they run low.",
  },
  {
    icon: "ChartNoAxesCombined",
    title: "Reports & Analytics",
    description:
      "Turn warehouse activity into a useful overview of stock, orders, and the work happening across your team.",
  },
  {
    icon: "ShieldCheck",
    title: "Role-based Access",
    description:
      "Give admins, managers, sales teams, and suppliers access that fits the way they work.",
  },
];

export const howItWorks = {
  eyebrow: "Get started in three steps",
  title: "A simpler way to stay in control",
  subtitle:
    "Get your warehouse operations moving with a clear, connected workflow.",
  steps: [
    {
      number: "01",
      title: "Create your account",
      description:
        "Set up your workspace and invite the people who keep your operation moving.",
    },
    {
      number: "02",
      title: "Manage products and stock",
      description:
        "Organize your products, monitor quantities, and record stock movements.",
    },
    {
      number: "03",
      title: "Track orders and reports",
      description:
        "Follow orders and supplier requests while keeping an eye on warehouse activity.",
    },
  ],
};

export const stats = [
  { value: 10, suffix: "K+", label: "Products Managed" },
  { value: 500, suffix: "+", label: "Warehouses" },
  { value: 99, suffix: "%", label: "Stock Accuracy" },
  { value: 24, suffix: "/7", label: "Support" },
];

export const gallery = {
  eyebrow: "Inside the operation",
  title: "Built for the flow of your warehouse",
  subtitle:
    "From organized shelving to the last mile, keep every part of your operation in view.",
  images: [
    {
      src: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1000&q=80",
      alt: "Tall rows of organized warehouse shelving",
      label: "Organized storage",
    },
    {
      src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=80",
      alt: "Warehouse inventory arranged across storage shelves",
      label: "Inventory in view",
    },
    {
      src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1000&q=80",
      alt: "Forklift moving goods through a logistics warehouse",
      label: "Keep things moving",
    },
    {
      src: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1000&q=80",
      alt: "Packages prepared for warehouse dispatch",
      label: "Ready for dispatch",
    },
    {
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1000&q=80",
      alt: "Logistics team coordinating goods and deliveries",
      label: "Connected operations",
    },
    {
      src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
      alt: "Warehouse aisle with shelves reaching toward the ceiling",
      label: "Space to scale",
    },
  ],
};

export const callToAction = {
  title: "Ready to organize your warehouse?",
  description:
    "Bring your products, people, and daily operations together with WareHub.",
  action: { label: "Create Free Account", href: "/signup" },
};

export const footerContent = {
  description: brand.description,
  quickLinksTitle: "Quick Links",
  contactTitle: "Get in touch",
  contact: [
    { type: "email", label: "hello@warehub.example", href: "mailto:hello@warehub.example" },
    { type: "phone", label: "+1 (555) 010-2040", href: "tel:+15550102040" },
    { type: "address", label: "1200 Market Street, San Francisco, CA" },
  ],
  socialLinks: [
    { platform: "LinkedIn", href: "https://www.linkedin.com/" },
    { platform: "Instagram", href: "https://www.instagram.com/" },
    { platform: "Facebook", href: "https://www.facebook.com/" },
  ],
  copyright: `© ${new Date().getFullYear()} WareHub. All rights reserved.`,
};
