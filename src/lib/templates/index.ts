export interface Template {
  id: string;
  name: string;
  description: string;
  framework: string;
  icon: string;
  files: Array<{ path: string; content: string }>;
}

const sharedStyles = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #f5f5f5;
  --card-foreground: #0a0a0a;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --secondary: #e5e7eb;
  --secondary-foreground: #0a0a0a;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --border: #e5e7eb;
  --destructive: #ef4444;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #1a1a1a;
  --card-foreground: #fafafa;
  --primary: #818cf8;
  --primary-foreground: #0a0a0a;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #1a1a1a;
  --muted-foreground: #a1a1aa;
  --border: #27272a;
  --destructive: #7f1d1d;
}

body {
  font-family: ui-sans-serif, system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  margin: 0;
  padding: 0;
}`;

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        destructive: 'var(--destructive)',
      },
    },
  },
  plugins: [],
};`;

export const TEMPLATES: Template[] = [
  {
    id: 'python-flask',
    name: 'Python Flask App',
    description: 'A Flask web application with routes and templates — requires local Python setup',
    framework: 'python',
    icon: 'server',
    files: [
      {
        path: 'app.py',
        content: `from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", message="Hello from Flask!")

@app.route("/about")
def about():
    return "About page"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)`,
      },
      {
        path: 'requirements.txt',
        content: 'flask==3.1.1\n',
      },
      {
        path: 'templates/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flask App</title>
</head>
<body>
  <h1>{{ message }}</h1>
  <p>Welcome to your Flask application!</p>
</body>
</html>`,
      },
      {
        path: 'SETUP.md',
        content: `# Flask App Setup

## Windows
\`\`\`
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
\`\`\`

## macOS / Linux
\`\`\`
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
\`\`\`

Then open http://127.0.0.1:5000 in your browser.
`,
      },
    ],
  },
  {
    id: 'vanilla-html',
    name: 'Blank HTML/CSS/JS',
    description: 'A simple vanilla HTML project with separate CSS and JavaScript files — no frameworks',
    framework: 'vanilla',
    icon: 'code',
    files: [
      {
        path: 'index.html',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
      },
      {
        path: 'style.css',
        content: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #f8fafc;\n  color: #0f172a;\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\nh1 {\n  color: #6366f1;\n  font-size: 2.5rem;\n}',
      },
      {
        path: 'script.js',
        content: 'console.log("Hello from vanilla JS!");',
      },
    ],
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A modern landing page with hero, features, and pricing sections',
    framework: 'nextjs',
    icon: 'globe',
    files: [
      {
        path: 'src/app/globals.css',
        content: sharedStyles,
      },
      {
        path: 'tailwind.config.js',
        content: tailwindConfig,
      },
      {
        path: 'src/app/layout.tsx',
        content: `import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        path: 'index.tsx',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/app/page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      },
      {
        path: 'index.html',
        content: '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div></body></html>',
      },
      {
        path: 'src/app/page.tsx',
        content: `'use client';
import { useState } from 'react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <span className="text-xl font-bold text-foreground">Logo</span>
              <div className="flex items-center gap-4">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              Build Something
              <span className="text-primary"> Amazing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Create production-ready web applications with the power of AI.
              Describe your idea and watch it come to life.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Start Building
              </button>
              <button className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-secondary font-medium">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Everything you need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Fast Performance', desc: 'Lightning-fast builds and instant deployments with modern tooling.' },
                { title: 'Beautiful Design', desc: 'Polished components and layouts that look great out of the box.' },
                { title: 'Easy Integration', desc: 'Connect to any API or service with minimal configuration.' },
              ].map((feature) => (
                <div key={feature.title} className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            Built with TavryneAI. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}`,
      },
    ],
  },
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'A full-stack todo application with local state management',
    framework: 'react',
    icon: 'check-square',
    files: [
      {
        path: 'index.html',
        content: '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="src/styles.css"></head><body><div id="root"></div></body></html>',
      },
      {
        path: 'src/styles.css',
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
.container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
h1 { text-align: center; margin-bottom: 2rem; color: #6366f1; }
.input-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
input[type="text"] { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; }
input[type="text"]:focus { outline: none; border-color: #6366f1; }
button { padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; }
button:hover { background: #4f46e5; }
.todo-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem; }
.todo-item.completed span { text-decoration: line-through; color: #94a3b8; }
.todo-item span { flex: 1; }
.todo-item input[type="checkbox"] { width: 1.25rem; height: 1.25rem; accent-color: #6366f1; }
.delete-btn { background: transparent; color: #ef4444; padding: 0.25rem 0.5rem; font-size: 0.875rem; }
.delete-btn:hover { background: #fef2f2; }
.stats { text-align: center; margin-top: 1.5rem; color: #64748b; font-size: 0.875rem; }`,
      },
      {
        path: 'index.tsx',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      },
      {
        path: 'src/App.tsx',
        content: `import { useState } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className="container">
      <h1>📋 Todo App</h1>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      {todos.map((todo) => (
        <div key={todo.id} className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.text}</span>
          <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
        </div>
      ))}
      {todos.length > 0 && (
        <div className="stats">
          {completed} of {todos.length} tasks completed
        </div>
      )}
      {todos.length === 0 && (
        <div className="stats">No tasks yet. Add one above!</div>
      )}
    </div>
  );
}`,
      },
    ],
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'A responsive analytics dashboard with charts and data tables',
    framework: 'react',
    icon: 'bar-chart',
    files: [
      {
        path: 'index.html',
        content: '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="src/styles.css"></head><body><div id="root"></div></body></html>',
      },
      {
        path: 'src/styles.css',
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; }
.layout { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: #1e293b; color: white; padding: 1.5rem; }
.sidebar h2 { margin-bottom: 2rem; font-size: 1.25rem; }
.sidebar a { display: block; padding: 0.75rem 1rem; color: #94a3b8; text-decoration: none; border-radius: 0.5rem; margin-bottom: 0.25rem; }
.sidebar a:hover, .sidebar a.active { background: #334155; color: white; }
.main { flex: 1; padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { font-size: 1.5rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-card h3 { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
.stat-card .value { font-size: 1.75rem; font-weight: bold; }
.stat-card .change { font-size: 0.875rem; margin-top: 0.25rem; }
.stat-card .change.up { color: #22c55e; }
.stat-card .change.down { color: #ef4444; }
.chart-container { background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
.chart-container h3 { margin-bottom: 1rem; color: #64748b; font-size: 0.875rem; }
.chart-bars { display: flex; align-items: end; gap: 0.75rem; height: 200px; padding-top: 1rem; }
.chart-bar { flex: 1; background: linear-gradient(to top, #6366f1, #818cf8); border-radius: 0.25rem 0.25rem 0 0; min-height: 20px; transition: height 0.3s; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; }
th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
th { background: #f8fafc; font-weight: 500; color: #64748b; font-size: 0.875rem; }
.status { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.status.active { background: #dcfce7; color: #16a34a; }
.status.pending { background: #fef9c3; color: #ca8a04; }`,
      },
      {
        path: 'index.tsx',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      },
      {
        path: 'src/App.tsx',
        content: `import { useState } from 'react';

const stats = [
  { label: 'Total Users', value: '24,563', change: '+12%', direction: 'up' as const },
  { label: 'Revenue', value: '$45,234', change: '+8%', direction: 'up' as const },
  { label: 'Active Now', value: '1,234', change: '-3%', direction: 'down' as const },
  { label: 'Bounce Rate', value: '24.5%', change: '-2%', direction: 'up' as const },
];

const chartData = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const recentOrders = [
  { id: '#1234', customer: 'Alice Johnson', product: 'Pro Plan', status: 'active' as const, amount: '$29' },
  { id: '#1235', customer: 'Bob Smith', product: 'Team Plan', status: 'pending' as const, amount: '$99' },
  { id: '#1236', customer: 'Carol White', product: 'Pro Plan', status: 'active' as const, amount: '$29' },
  { id: '#1237', customer: 'David Brown', product: 'Enterprise', status: 'active' as const, amount: '$299' },
];

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>✨ Dashboard</h2>
        {['dashboard', 'analytics', 'users', 'settings'].map((item) => (
          <a
            key={item}
            href="#"
            className={activeNav === item ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); setActiveNav(item); }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </a>
        ))}
      </div>
      <div className="main">
        <div className="header">
          <h1>Dashboard</h1>
          <button onClick={() => alert('Refreshing...')} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <h3>{s.label}</h3>
              <div className="value">{s.value}</div>
              <div className={'change ' + s.direction}>{s.change} vs last month</div>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <h3>Monthly Revenue</h3>
          <div className="chart-bars">
            {chartData.map((val, i) => (
              <div key={i} className="chart-bar" style={{ height: val + '%' }} title={months[i] + ': $' + (val * 1000)} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            {months.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        <div className="chart-container">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Product</th><th>Status</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td><span className={'status ' + order.status}>{order.status}</span></td>
                  <td>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`,
      },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
