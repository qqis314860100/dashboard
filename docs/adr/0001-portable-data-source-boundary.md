# Keep dashboard data behind a portable data-source boundary

The standalone module will use realistic mock data because the host administration system's APIs, stores, and shared components are unavailable here. Views will consume a typed data-source interface so migration back into the host system replaces adapters rather than rewriting the UI and interaction layer.
