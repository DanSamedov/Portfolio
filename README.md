# Portfolio Website

A modern, interactive portfolio website showcasing my projects and skills as a Full Stack Developer.

**Live Demo:** [samedov.org](https://samedov.org)

> **Tip:** For the best interactive experience with 3D models, view on desktop.

![Portfolio Preview](frontend/public/assets/static/portfolio_design.png)

## Features

- **Interactive 3D Elements** - Animated avatar and keyboard built with Three.js/React Three Fiber
- **Flip Cards** - Project cards with smooth 3D flip animations revealing detailed information
- **Draggable Tech Stickers** - Interactive technology icons that can be dragged around
- **Dark/Light Mode** - Theme toggle with smooth transitions
- **Contact Form** - Functional email form with rate limiting and validation
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Micro-interactions and scroll animations throughout
- **Auto-Updated Resume** - CV automatically fetched from private repo during deployment

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| Vite | Build Tool |
| Three.js / React Three Fiber | 3D Graphics |
| TailwindCSS | Styling |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Django | Web Framework |
| Django REST Framework | API |
| PostgreSQL | Database |
| Gunicorn | WSGI Server |
| WhiteNoise | Static Files |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD Pipeline |
| Nginx | Reverse Proxy |
| Hetzner VPS | Hosting |

## Project Structure

```
portfolio/
├── frontend/               # React application
│   ├── public/assets/      # Static assets (images, models, icons)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── data/           # Project data (JSON)
│   │   └── styles.css      # Global styles
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # Django application
│   ├── api/                # REST API app
│   ├── core/               # Django settings
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.prod.yml
└── .github/workflows/
    └── deploy.yml          # CI/CD pipeline
```

## Contact

- **Website:** [samedov.org](https://samedov.org)
- **Email:** samedovdanylo@gmail.com
- **LinkedIn:** [Danylo Samedov](https://www.linkedin.com/in/danylo-samedov-b557132b1/)
- **GitHub:** [DanSamedov](https://github.com/DanSamedov)

## License

This project is open source and available under the [MIT License](LICENSE).
