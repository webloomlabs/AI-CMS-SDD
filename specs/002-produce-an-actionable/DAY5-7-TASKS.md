# Days 5-7 Implementation Guide: Frontend & Deployment

**Date**: October 11, 2025  
**Features**: Frontend Admin Dashboard + Deployment  
**Goal**: Complete the MVP with React admin UI and production deployment  
**Time Budget**: 22 hours (Day 5: 8h, Day 6: 8h, Day 7: 6h)

## Prerequisites ✅

Before starting Days 5-7, ensure these are complete:

- [x] Phase 1-2: Setup & Foundational ✅
- [x] Phase 3: User Story 1 - Authentication API ✅
- [x] Phase 4: User Story 2 - Content CRUD API ✅
- [x] Phase 5: User Story 3 - Media Upload API ✅
- [x] Phase 6: User Story 4 - AI Generation API ✅
- [x] Backend: 119/119 tests passing ✅
- [x] Backend running on http://localhost:3001 ✅

---

## Day 5: Frontend Setup & Login (8 hours)

### Overview

Create a React frontend with TypeScript, Tailwind CSS, and shadcn/ui. Implement login page that connects to backend auth API.

### Task Breakdown

| ID | Task | File | Est. Time |
|---|---|---|---|
| T046 | Initialize React + TypeScript project | `frontend/` | 0.5h |
| T047 | Install dependencies | `frontend/package.json` | 0.5h |
| T048 | Configure Tailwind CSS | `frontend/tailwind.config.js` | 0.5h |
| T049 | Set up shadcn/ui | `frontend/components.json` | 0.5h |
| T050 | Create project structure | `frontend/src/` | 0.5h |
| T051 | Create API client service | `frontend/src/services/api.ts` | 0.5h |
| T052 | Create auth service | `frontend/src/services/auth.ts` | 0.5h |
| T053 | Create auth hook | `frontend/src/hooks/useAuth.ts` | 0.5h |
| T054 | Create Login page | `frontend/src/pages/Login.tsx` | 1.0h |
| T055 | Create ProtectedRoute | `frontend/src/components/ProtectedRoute.tsx` | 0.5h |
| T056 | Set up routing | `frontend/src/App.tsx` | 0.5h |
| T057 | Create UI components | `frontend/src/components/ui/` | 1.0h |
| T058 | Write Login tests | `frontend/tests/Login.test.tsx` | 0.5h |
| T059 | Write auth service tests | `frontend/tests/auth.test.ts` | 0.5h |
| T060 | Add responsive styling | `frontend/src/App.css` | 0.5h |
| T061 | Update .env.sample | `frontend/.env.sample` | 0.25h |

**Total**: 8 hours

---

### T046: Initialize React + TypeScript Project

**Command**:
```bash
npx create-react-app frontend --template typescript
cd frontend
```

**Verification**:
```bash
npm start  # Should open React app at http://localhost:3000
```

---

### T047: Install Dependencies

**Command**:
```bash
cd frontend
npm install react-router-dom axios
npm install -D @types/react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Verification**:
```bash
npm list  # Verify all packages installed
```

---

### T048: Configure Tailwind CSS

**File**: `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

**File**: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

---

### T049: Set up shadcn/ui

**File**: `frontend/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Install shadcn/ui components**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add label
npx shadcn-ui@latest add toast
```

---

### T050: Create Project Structure

```bash
cd frontend/src
mkdir -p components/ui
mkdir -p pages
mkdir -p services
mkdir -p hooks
mkdir -p lib
mkdir -p types
```

**File**: `frontend/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### T051: Create API Client Service

**File**: `frontend/src/services/api.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

export default new ApiClient();
```

---

### T052: Create Auth Service

**File**: `frontend/src/services/auth.ts`

```typescript
import api from './api';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
```

---

### T053: Create Auth Hook

**File**: `frontend/src/hooks/useAuth.ts`

```typescript
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import authService, { User, LoginCredentials } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user } = await authService.login(credentials);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### T054: Create Login Page

**File**: `frontend/src/pages/Login.tsx`

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI-Native CMS</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### T055: Create ProtectedRoute Component

**File**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

### T056: Set up Routing

**File**: `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to the AI-Native CMS!</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

### T061: Update .env.sample

**File**: `frontend/.env.sample`

```bash
REACT_APP_API_URL=http://localhost:3001/api/v1
```

**File**: `frontend/.env`

```bash
REACT_APP_API_URL=http://localhost:3001/api/v1
```

---

### Day 5 Verification

After completing all tasks:

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm start
```

**Test Login**:
1. Open http://localhost:3000
2. Should redirect to /login
3. Enter: admin@example.com / admin123
4. Should login and redirect to /dashboard
5. Refresh page - should stay logged in
6. Clear localStorage - should redirect to /login

---

## Day 6: Admin Dashboard UI (8 hours)

### Overview

Build complete admin dashboard with content management, media library, and AI integration.

### Task Breakdown

| ID | Task | Est. Time |
|---|---|---|
| T062 | Create Dashboard layout | 0.5h |
| T063 | Create ContentList page | 1.0h |
| T064 | Create content service | 0.5h |
| T065 | Create ContentEditor page | 1.5h |
| T066 | Add dynamic field rendering | 1.0h |
| T067 | Create ContentCard component | 0.5h |
| T068 | Create MediaLibrary modal | 1.0h |
| T069 | Create media service | 0.5h |
| T070 | Add drag-drop upload | 0.5h |
| T071 | Create MediaGrid component | 0.5h |
| T072 | Implement media attachment | 0.5h |
| T073 | Create AI service | 0.5h |
| T074 | Add AI generate button | 0.25h |
| T075 | Create AIGenerateModal | 0.5h |
| T076 | Integrate AI into workflow | 0.5h |
| T077 | Add loading/error states | 0.5h |
| T078 | Implement toast notifications | 0.5h |
| T079 | Responsive design | 0.5h |
| T080 | Write component tests | 1.0h |
| T081 | Add accessibility | 0.5h |

**Total**: 8 hours

(Task details for Day 6 would continue in similar detail...)

---

## Day 7: Deployment & Polish (6 hours)

### Overview

Containerize application, create deployment documentation, and perform final QA.

### Task Breakdown

| ID | Task | Est. Time |
|---|---|---|
| T082 | Create backend Dockerfile | 0.5h |
| T083 | Create frontend Dockerfile | 0.5h |
| T084 | Create docker-compose.yml | 0.5h |
| T085 | Create .dockerignore files | 0.25h |
| T086 | Add health checks | 0.25h |
| T087 | Update README | 0.5h |
| T088 | Add API documentation | 0.5h |
| T089 | Create deployment guide | 0.5h |
| T090 | Document env variables | 0.25h |
| T091 | Add troubleshooting guide | 0.25h |
| T092 | Run full test suite | 0.25h |
| T093 | End-to-end testing | 1.0h |
| T094 | Browser testing | 0.5h |
| T095 | Mobile responsiveness | 0.5h |
| T096 | Security audit | 0.25h |
| T097 | Performance testing | 0.25h |
| T098 | Bug fixes | 0.5h |
| T099 | Optimize bundles | 0.25h |
| T100 | Add build scripts | 0.25h |
| T101 | Create demo seeding | 0.25h |
| T102 | Prepare demo script | 0.25h |

**Total**: 6 hours

(Task details for Day 7 would continue...)

---

## Success Criteria

### Day 5 Complete When:
- [ ] Frontend app runs on http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can login with admin@example.com / admin123
- [ ] Redirects to dashboard after login
- [ ] Protected routes require authentication
- [ ] Logout clears session

### Day 6 Complete When:
- [ ] Can list all content items
- [ ] Can create new content
- [ ] Can edit existing content
- [ ] Can delete content
- [ ] Can upload media files
- [ ] Can attach media to content
- [ ] Can generate AI content
- [ ] All pages responsive
- [ ] Error handling working

### Day 7 Complete When:
- [ ] docker-compose up works
- [ ] Full user journey works end-to-end
- [ ] Documentation complete
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Performance < 300ms
- [ ] Demo ready

---

**Total Implementation Time**: 22 hours across 3 days  
**MVP Completion**: Full-stack application ready for deployment
