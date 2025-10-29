# shadcn/ui Component Usage Guide

> **Last Updated:** October 12, 2025
> **shadcn/ui Version:** Latest
> **Purpose:** Comprehensive guide for using shadcn/ui components in Cordiq

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Philosophy](#design-philosophy)
3. [Component Categories](#component-categories)
4. [Core Components](#core-components)
   - [Button](#button)
   - [Input](#input)
   - [Label](#label)
   - [Textarea](#textarea)
5. [Form Components](#form-components)
   - [Form with React Hook Form](#form-with-react-hook-form)
   - [Select](#select)
   - [Alert](#alert)
6. [Layout Components](#layout-components)
   - [Card](#card)
   - [Separator](#separator)
7. [Data Display](#data-display)
   - [Badge](#badge)
   - [Avatar](#avatar)
   - [Table](#table)
   - [Tabs](#tabs)
8. [Feedback Components](#feedback-components)
   - [Skeleton](#skeleton)
   - [Progress](#progress)
   - [Toast](#toast)
9. [Dialog Components](#dialog-components)
   - [Dialog](#dialog)
   - [AlertDialog](#alertdialog)
   - [Sheet](#sheet)
   - [DropdownMenu](#dropdownmenu)
   - [Popover](#popover)
10. [Dark Mode](#dark-mode)
11. [Design Tokens](#design-tokens)
12. [Accessibility Best Practices](#accessibility-best-practices)
13. [Migration Guide](#migration-guide)

---

## Introduction

This guide covers all shadcn/ui components used in Cordiq. shadcn/ui is **not a component library** but a collection of re-usable components that you can copy and paste into your project. Components are built on:

- **Radix UI**: Unstyled, accessible primitives
- **Tailwind CSS**: Utility-first styling
- **class-variance-authority**: Type-safe variant management
- **next-themes**: Dark mode support

**Benefits:**

- ✅ Full control over components (they're in your codebase)
- ✅ Accessibility built-in (WCAG 2.1 AA compliant)
- ✅ Type-safe with TypeScript
- ✅ Dark mode ready
- ✅ Customizable via design tokens

---

## Design Philosophy

### 1. **Composition Over Configuration**

shadcn components are designed to be composed together:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Contact Information</CardTitle>
    <CardDescription>View and edit contact details</CardDescription>
  </CardHeader>
  <CardContent>{/* Form fields here */}</CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### 2. **Semantic HTML**

Components use proper semantic HTML elements with ARIA attributes for accessibility.

### 3. **Design Tokens**

All colors, spacing, and typography use CSS custom properties defined in `globals.css`.

---

## Component Categories

| Category     | Components                                        | Use Case                         |
| ------------ | ------------------------------------------------- | -------------------------------- |
| **Core**     | Button, Input, Label, Textarea                    | Basic building blocks            |
| **Forms**    | Form, Select, Alert                               | Form validation and feedback     |
| **Layout**   | Card, Separator, Badge, Avatar                    | Structure and organization       |
| **Dialogs**  | Dialog, AlertDialog, Sheet, DropdownMenu, Popover | Overlays and menus               |
| **Feedback** | Skeleton, Progress, Toast                         | Loading states and notifications |
| **Data**     | Table, Tabs                                       | Data presentation                |

---

## Core Components

### Button

**Location:** `components/ui/button.tsx`

**Variants:**

- `default` (primary): Main actions (Submit, Save, Create)
- `destructive`: Delete, Remove actions
- `outline`: Secondary actions
- `secondary`: Tertiary actions
- `ghost`: Minimal actions (icon buttons, menu items)
- `link`: Text links styled as buttons

**Sizes:** `default`, `sm`, `lg`, `icon`

#### Examples

```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button variant="default">Save Contact</Button>

// Destructive action
<Button variant="destructive">Delete Contact</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

#### When to Use Each Variant

| Variant       | Use Case                 | Example                      |
| ------------- | ------------------------ | ---------------------------- |
| `default`     | Primary actions          | "Save Contact", "Create New" |
| `destructive` | Delete/remove actions    | "Delete Contact", "Remove"   |
| `outline`     | Secondary actions        | "Cancel", "Go Back"          |
| `secondary`   | Tertiary actions         | "Learn More", "View Details" |
| `ghost`       | Minimal UI, icon buttons | Menu items, close buttons    |
| `link`        | Text links               | "Forgot password?", "Terms"  |

---

### Input

**Location:** `components/ui/input.tsx`

**Props:** Extends native `<input>` HTML attributes

#### Examples

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Basic input
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>

// With error state (use within Form component)
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} type="email" />
      </FormControl>
      <FormMessage /> {/* Shows validation errors */}
    </FormItem>
  )}
/>
```

**Styling:**

- Automatically styled with design tokens
- Focus ring follows `ring-ring` token
- Error states handled by FormMessage

---

### Label

**Location:** `components/ui/label.tsx`

**Purpose:** Accessible form labels linked to inputs via `htmlFor`

#### Example

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="name">Full Name</Label>
<Input id="name" />
```

**Accessibility:**

- Always use `htmlFor` to link to input `id`
- Screen readers announce label when input is focused

---

### Textarea

**Location:** `components/ui/textarea.tsx`

**Props:** Extends native `<textarea>` HTML attributes

#### Example

```tsx
import { Textarea } from "@/components/ui/textarea";

<div>
  <Label htmlFor="notes">Notes</Label>
  <Textarea id="notes" placeholder="Additional information..." rows={5} />
</div>;
```

---

## Form Components

### Form with React Hook Form

**Location:** `components/ui/form.tsx`

**Dependencies:**

- `react-hook-form`
- `zod` (schema validation)
- `@hookform/resolvers/zod`

#### Complete Form Example

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

function ContactForm() {
  // 2. Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      priority: "MEDIUM",
    },
  });

  // 3. Submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  // 4. Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Text input field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>The contact's full name.</FormDescription>
              <FormMessage />{" "}
              {/* Error message auto-linked via aria-describedby */}
            </FormItem>
          )}
        />

        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select field */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Contact</Button>
      </form>
    </Form>
  );
}
```

#### Form Component Structure

```
<Form {...form}>                    ← Provides form context
  <form onSubmit={...}>
    <FormField                      ← Wraps each field
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>                  ← Container for spacing
          <FormLabel>...</FormLabel> ← Accessible label
          <FormControl>             ← Wraps input
            <Input {...field} />
          </FormControl>
          <FormDescription>       ← Optional help text
            ...
          </FormDescription>
          <FormMessage />          ← Error message (auto-linked via aria-describedby)
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Accessibility:**

- `FormLabel` automatically linked to input via `aria-labelledby`
- `FormMessage` automatically linked via `aria-describedby`
- Validation errors announced to screen readers

---

### Select

**Location:** `components/ui/select.tsx`

#### Example

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select onValueChange={setValue} defaultValue="medium">
  <SelectTrigger>
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="high">High Priority</SelectItem>
    <SelectItem value="medium">Medium Priority</SelectItem>
    <SelectItem value="low">Low Priority</SelectItem>
  </SelectContent>
</Select>;
```

---

### Alert

**Location:** `components/ui/alert.tsx`

**Variants:** `default`, `destructive`

#### Examples

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Info alert
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can save your contact information here.
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save contact. Please try again.
  </AlertDescription>
</Alert>
```

---

## Layout Components

### Card

**Location:** `components/ui/card.tsx`

**Components:**

- `Card`: Container
- `CardHeader`: Top section
- `CardTitle`: Main heading
- `CardDescription`: Subtitle
- `CardContent`: Main content area
- `CardFooter`: Bottom section (buttons, actions)

#### Example

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

<Card>
  <CardHeader>
    <CardTitle>Contact Details</CardTitle>
    <CardDescription>View and manage contact information</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Name: John Doe</p>
    <p>Email: john@example.com</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>;
```

#### Composition Patterns

**1. Simple Info Card**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Contacts</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">142</p>
  </CardContent>
</Card>
```

**2. Form Card**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Create Contact</CardTitle>
    <CardDescription>Add a new contact to your network</CardDescription>
  </CardHeader>
  <CardContent>
    <Form>{/* Form fields */}</Form>
  </CardContent>
  <CardFooter>
    <Button type="submit">Create</Button>
  </CardFooter>
</Card>
```

**3. List Card**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent Contacts</CardTitle>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      {contacts.map((contact) => (
        <li key={contact.id}>{contact.name}</li>
      ))}
    </ul>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">View All</Button>
  </CardFooter>
</Card>
```

---

### Separator

**Location:** `components/ui/separator.tsx`

**Orientation:** `horizontal` (default), `vertical`

#### Examples

```tsx
import { Separator } from "@/components/ui/separator"

// Horizontal separator
<div>
  <p>Section 1</p>
  <Separator className="my-4" />
  <p>Section 2</p>
</div>

// Vertical separator
<div className="flex h-5 items-center space-x-4">
  <div>Item 1</div>
  <Separator orientation="vertical" />
  <div>Item 2</div>
</div>
```

---

## Data Display

### Badge

**Location:** `components/ui/badge.tsx`

**Variants:**

- `default`: Neutral/informational
- `secondary`: Less prominent
- `destructive`: Errors, warnings, high priority
- `outline`: Subtle, borders

#### Examples

```tsx
import { Badge } from "@/components/ui/badge"

// Priority badges
<Badge variant="destructive">High Priority</Badge>
<Badge variant="default">Medium Priority</Badge>
<Badge variant="secondary">Low Priority</Badge>

// Status badges
<Badge variant="outline">Pending</Badge>
<Badge variant="default">Active</Badge>
```

#### Semantic Usage

```tsx
// Priority levels
{
  priority === "HIGH" && <Badge variant="destructive">High</Badge>;
}
{
  priority === "MEDIUM" && <Badge variant="default">Medium</Badge>;
}
{
  priority === "LOW" && <Badge variant="secondary">Low</Badge>;
}
```

---

### Avatar

**Location:** `components/ui/avatar.tsx`

**Components:**

- `Avatar`: Container
- `AvatarImage`: Image element
- `AvatarFallback`: Fallback text/initials

#### Example

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src={user.profilePicture} alt={user.name} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>;
```

**With size variants:**

```tsx
// Small avatar
<Avatar className="h-8 w-8">
  <AvatarImage src={src} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Large avatar
<Avatar className="h-20 w-20">
  <AvatarImage src={src} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### Table

**Location:** `components/ui/table.tsx`

#### Example

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableCaption>List of contacts</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Priority</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {contacts.map((contact) => (
      <TableRow key={contact.id}>
        <TableCell>{contact.name}</TableCell>
        <TableCell>{contact.email}</TableCell>
        <TableCell>
          <Badge variant={getPriorityVariant(contact.priority)}>
            {contact.priority}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

---

### Tabs

**Location:** `components/ui/tabs.tsx`

#### Example

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="contacts">Contacts</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>{/* Profile content */}</CardContent>
    </Card>
  </TabsContent>
  <TabsContent value="contacts">{/* Contacts content */}</TabsContent>
  <TabsContent value="settings">{/* Settings content */}</TabsContent>
</Tabs>;
```

---

## Feedback Components

### Skeleton

**Location:** `components/ui/skeleton.tsx`

**Purpose:** Loading placeholders for content

#### Examples

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-[200px]" />
    <Skeleton className="h-4 w-[300px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>

// Avatar skeleton
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

---

### Progress

**Location:** `components/ui/progress.tsx`

**Purpose:** Progress bars and loading indicators

#### Examples

```tsx
import { Progress } from "@/components/ui/progress"

// Basic progress
<Progress value={60} />

// Password strength indicator
<div>
  <Label>Password Strength</Label>
  <Progress value={passwordStrength} className="mt-2" />
  <p className="text-sm text-muted-foreground mt-1">
    {getStrengthLabel(passwordStrength)}
  </p>
</div>
```

---

### Toast

**Location:** `components/ui/toast.tsx`, `components/ui/toaster.tsx`

**Purpose:** Temporary notifications

#### Setup

1. Add `<Toaster />` to your layout:

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

2. Use the `useToast` hook:

```tsx
import { useToast } from "@/components/ui/use-toast";

function MyComponent() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Contact saved",
          description: "Your contact has been saved successfully.",
        });
      }}
    >
      Save Contact
    </Button>
  );
}
```

#### Toast Variants

```tsx
// Success toast
toast({
  title: "Success",
  description: "Contact created successfully.",
});

// Error toast
toast({
  variant: "destructive",
  title: "Error",
  description: "Failed to save contact. Please try again.",
});

// With action button
toast({
  title: "Contact deleted",
  description: "John Doe has been removed from your contacts.",
  action: <ToastAction altText="Undo">Undo</ToastAction>,
});
```

---

## Dialog Components

### Dialog

**Location:** `components/ui/dialog.tsx`

**Purpose:** Modal overlays for forms, confirmations

#### Example

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Edit Contact</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Contact</DialogTitle>
      <DialogDescription>
        Make changes to the contact information here.
      </DialogDescription>
    </DialogHeader>
    <Form>{/* Form fields */}</Form>
  </DialogContent>
</Dialog>;
```

**With controlled state:**

```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Content */}
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>
```

---

### AlertDialog

**Location:** `components/ui/alert-dialog.tsx`

**Purpose:** Confirmation dialogs (destructive actions)

#### Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Contact</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the contact
        from your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

**Accessibility:**

- Focus trapped inside dialog
- Escape key closes dialog
- Backdrop click closes dialog
- Proper ARIA attributes (`role="alertdialog"`, `aria-labelledby`, `aria-describedby`)

---

### Sheet

**Location:** `components/ui/sheet.tsx`

**Purpose:** Side panels, drawers

**Sides:** `top`, `right`, `bottom`, `left`

#### Example

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Filters</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filter Contacts</SheetTitle>
      <SheetDescription>
        Apply filters to refine your contact list
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">{/* Filter options */}</div>
  </SheetContent>
</Sheet>;
```

---

### DropdownMenu

**Location:** `components/ui/dropdown-menu.tsx`

**Purpose:** Context menus, action menus

#### Example

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem onClick={handleEdit}>Edit Contact</DropdownMenuItem>
    <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

---

### Popover

**Location:** `components/ui/popover.tsx`

**Purpose:** Contextual overlays, tooltips with content

#### Example

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Info</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-medium">Contact Info</h4>
      <p className="text-sm text-muted-foreground">
        Additional details about this contact.
      </p>
    </div>
  </PopoverContent>
</Popover>;
```

---

## Dark Mode

**Implementation:** `next-themes` + shadcn ThemeProvider

### Setup

See `components/theme-provider.tsx` and `components/theme-toggle.tsx`

### Usage in Components

**CSS Variables automatically adapt:**

```tsx
// This works in both light and dark mode
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**No manual dark mode classes needed!**

```tsx
// ❌ DON'T DO THIS
<div className="bg-white dark:bg-gray-900">

// ✅ DO THIS INSTEAD
<div className="bg-background">
```

### Theme Toggle

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

<ThemeToggle /> {/* Adds theme switcher dropdown */}
```

---

## Design Tokens

All design tokens are defined in `app/globals.css` as CSS custom properties.

### Color Tokens

```css
--background: /* Page background */ --foreground: /* Primary text color */
  --card: /* Card background */ --card-foreground: /* Card text color */
  --popover: /* Popover background */ --popover-foreground: /* Popover text */
  --primary: /* Primary brand color */
  --primary-foreground: /* Text on primary */ --secondary: /* Secondary color */
  --secondary-foreground: /* Text on secondary */
  --muted: /* Muted background */ --muted-foreground: /* Muted text */
  --accent: /* Accent background */ --accent-foreground: /* Accent text */
  --destructive: /* Error/delete color */
  --destructive-foreground: /* Text on destructive */
  --border: /* Border color */ --input: /* Input border color */
  --ring: /* Focus ring color */;
```

### Using Design Tokens

```tsx
// Backgrounds
className = "bg-background";
className = "bg-card";
className = "bg-muted";
className = "bg-primary";
className = "bg-destructive";

// Text colors
className = "text-foreground";
className = "text-muted-foreground";
className = "text-primary";
className = "text-destructive";

// Borders
className = "border border-border";
className = "border-input";

// Focus rings
className = "focus-visible:ring-2 focus-visible:ring-ring";
```

---

## Accessibility Best Practices

All shadcn components are **WCAG 2.1 AA compliant** by default. Follow these guidelines:

### 1. **Always Use Labels**

```tsx
// ✅ Correct
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ❌ Incorrect
<Input placeholder="Email" /> {/* Placeholder is not a label */}
```

### 2. **Link Error Messages**

```tsx
// ✅ Correct - FormMessage automatically links via aria-describedby
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Auto-linked */}
    </FormItem>
  )}
/>
```

### 3. **Use Semantic Components**

```tsx
// ✅ Correct - AlertDialog for destructive actions
<AlertDialog>
  <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
  <AlertDialogDescription>
    This action cannot be undone.
  </AlertDialogDescription>
</AlertDialog>

// ✅ Correct - Dialog for forms
<Dialog>
  <DialogTitle>Edit Contact</DialogTitle>
  <DialogDescription>
    Update contact information
  </DialogDescription>
</Dialog>
```

### 4. **Ensure Keyboard Navigation**

All shadcn components support:

- Tab key navigation
- Enter/Space key activation
- Escape key to close dialogs
- Arrow keys in menus/selects

### 5. **Maintain Focus Indicators**

```tsx
// ✅ shadcn components have focus rings by default
<Button>Click me</Button> {/* Has focus-visible:ring-2 */}
<Input /> {/* Has focus-visible:ring-2 */}

// Don't remove focus styles!
```

### 6. **Provide Sufficient Color Contrast**

All shadcn design tokens meet WCAG AA contrast ratios (4.5:1 for text, 3:1 for UI components).

**Verified Ratios:**

- Light Mode: Foreground on Background = **20.35:1** ✅
- Dark Mode: Foreground on Background = **19.53:1** ✅
- Primary on Background (Light) = **5.15:1** ✅
- Destructive on Background (Light) = **4.56:1** ✅

See `ACCESSIBILITY_AUDIT.md` for complete audit results.

---

## Migration Guide

### Converting Custom Components to shadcn

#### Before (Custom Component)

```tsx
// Custom button with manual dark mode
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
  Save
</button>
```

#### After (shadcn Button)

```tsx
import { Button } from "@/components/ui/button";

<Button>Save</Button>;
```

**Benefits:**

- No manual dark mode classes
- Consistent styling across app
- Accessibility built-in
- Type-safe variants

---

#### Before (Custom Card)

```tsx
<div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow">
  <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
    Contact Info
  </h2>
  <p className="text-gray-600 dark:text-gray-300">Details here</p>
</div>
```

#### After (shadcn Card)

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Contact Info</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Details here</p>
  </CardContent>
</Card>;
```

**Benefits:**

- Design tokens handle dark mode automatically
- Semantic structure (CardHeader, CardContent)
- Consistent spacing and styling

---

#### Before (Custom Form)

```tsx
<form>
  <label className="block text-sm font-medium mb-1">Email</label>
  <input className="border rounded px-3 py-2 w-full" type="email" />
  {error && <p className="text-red-500 text-sm">{error}</p>}
</form>
```

#### After (shadcn Form)

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage /> {/* Auto-linked error message */}
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Benefits:**

- Automatic error handling with React Hook Form
- Zod schema validation
- ARIA attributes auto-linked
- Type-safe form values

---

## Common Patterns

### Contact Card Pattern

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src={contact.profilePicture} />
        <AvatarFallback>{contact.initials}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle>{contact.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{contact.company}</p>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Email:</span>
        <span className="text-sm">{contact.email}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Priority:</span>
        <Badge variant={getPriorityVariant(contact.priority)}>
          {contact.priority}
        </Badge>
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline" onClick={onEdit}>
      Edit
    </Button>
    <Button variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  </CardFooter>
</Card>
```

### Dashboard Stats Card Pattern

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{contactCount}</div>
    <p className="text-xs text-muted-foreground">
      +{newContactsThisMonth} from last month
    </p>
  </CardContent>
</Card>
```

### Search and Filter Pattern

```tsx
<div className="space-y-4">
  {/* Search */}
  <div className="flex items-center space-x-2">
    <Input
      placeholder="Search contacts..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* Filters */}
  <div className="flex gap-2">
    <Select value={priority} onValueChange={setPriority}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="low">Low</SelectItem>
      </SelectContent>
    </Select>

    <Select value={company} onValueChange={setCompany}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Company" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company} value={company}>
            {company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
```

---

## Additional Resources

- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Radix UI Primitives:** https://www.radix-ui.com
- **Tailwind CSS:** https://tailwindcss.com
- **React Hook Form:** https://react-hook-form.com
- **Zod Validation:** https://zod.dev
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Questions or Issues?

If you encounter issues or need clarification:

1. Check the [shadcn/ui documentation](https://ui.shadcn.com)
2. Review component source code in `components/ui/`
3. See `ACCESSIBILITY_AUDIT.md` for accessibility guidelines
4. Refer to existing implementations in the codebase

---

**Last Updated:** October 12, 2025
**Maintained by:** Cordiq Development Team
