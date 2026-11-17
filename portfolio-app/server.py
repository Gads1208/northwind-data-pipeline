#!/usr/bin/env python3
"""
GUILHERME.DATA&AI — Portfolio Web Server & SQLite Telemetry API
================================================================
Servidor HTTP + API REST em Python puro (zero dependências externas) com
persistência em SQLite (analytics.db) para rastrear acessos, seções visitadas,
cliques em projetos, origens de tráfego (LinkedIn, Currículo, GitHub) e sessões.

Uso:
  python3 server.py
  Acesse:
    - Portfólio:  http://localhost:3000
    - Dashboard:  http://localhost:3000/analytics.html
"""

import datetime
import http.server
import json
import os
import random
import socketserver
import sqlite3
import sys
import urllib.parse

PORT = int(os.environ.get("PORT", 3000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DIRECTORY, "analytics.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS portfolio_events (
                id TEXT PRIMARY KEY,
                visitor_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                page_path TEXT NOT NULL,
                page_title TEXT NOT NULL,
                target_name TEXT DEFAULT '',
                target_url TEXT DEFAULT '',
                source TEXT DEFAULT 'Acesso Direto',
                referrer TEXT DEFAULT 'direto',
                device TEXT DEFAULT 'Desktop',
                os TEXT DEFAULT 'Linux',
                browser TEXT DEFAULT 'Chrome',
                screen TEXT DEFAULT '1920x1080',
                duration_sec INTEGER DEFAULT 0,
                is_demo INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON portfolio_events(timestamp DESC)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_type ON portfolio_events(event_type)"
        )

        # Verifica se o banco está vazio; se estiver, popula histórico inicial realista
        cur = conn.execute("SELECT COUNT(*) AS cnt FROM portfolio_events")
        count = cur.fetchone()["cnt"]
        if count == 0:
            seed_demo_events(conn, days=14, visitors_count=48)
    conn.close()


def seed_demo_events(conn, days=14, visitors_count=48):
    """Gera massa histórica realista de acessos de recrutadores e visitantes."""
    now = datetime.datetime.now(datetime.timezone.utc)
    sources = [
        ("LinkedIn", "https://www.linkedin.com/", 0.42),
        ("Currículo (PDF)", "direto", 0.24),
        ("GitHub", "https://github.com/Gads1208", 0.18),
        ("Acesso Direto", "direto", 0.10),
        ("WhatsApp", "https://wa.me/", 0.06),
    ]
    devices = [
        ("Desktop", "Windows", "Chrome", "1920x1080", 0.52),
        ("Desktop", "macOS", "Chrome", "1728x1117", 0.18),
        ("Desktop", "Linux", "Firefox", "2560x1440", 0.10),
        ("Mobile", "iOS", "Safari", "390x844", 0.12),
        ("Mobile", "Android", "Chrome", "412x915", 0.08),
    ]
    sections = [
        ("hero", "/#hero", "Início (Hero Executivo)", 0.98),
        ("flagship", "/#flagship", "Northwind BI (Flagship Case)", 0.88),
        ("tab-architecture", "/#architecture", "Northwind • Arquitetura Medallion & MCP", 0.68),
        ("tab-simulator", "/#simulator", "Northwind • Simulador Multi-Agente IA", 0.62),
        ("northwind-jev-store", "/#northwind-jev-store", "Loja Jev IA (E-Commerce)", 0.57),
        ("telegram-bot", "/#telegram-bot", "Bot Telegram (OpenClaw + Gemini)", 0.53),
        ("gitdigest", "/#gitdigest", "GitDigest (Auditoria Git & PDF)", 0.49),
        ("car-price-ai", "/#car-price-ai", "Car Price AI (Redes Neurais)", 0.46),
        ("skills", "/#skills", "Habilidades & Stack Técnica", 0.64),
        ("about", "/#about", "Sobre Mim & Trajetória Profissional", 0.72),
        ("contact", "/#contact", "Contato & Redes Sociais", 0.41),
    ]
    projects = [
        ("/projeto/northwind-bi", "Projeto: Northwind BI (Render)", "Northwind BI Dashboard", "https://northwind-data-pipeline.onrender.com", 0.48),
        ("/projeto/telegram-bot", "Projeto: Bot Telegram (OpenClaw)", "Bot Telegram Northwind", "https://t.me/Guilherme_northwind_bot", 0.31),
        ("/projeto/loja-jev-ia", "Projeto: Loja Jev IA (E-Commerce)", "Loja Northwind Jev IA", "https://northwind-market-jev.onrender.com", 0.29),
        ("/projeto/gitdigest", "Projeto: GitDigest (Auditoria PDF)", "GitDigest (PDF + IA)", "https://repo-change-summary.onrender.com", 0.25),
        ("/projeto/car-price-ai", "Projeto: Car Price AI (Render)", "Car Price AI (ML)", "https://car-price-predictor-cjac.onrender.com/", 0.23),
        ("/projeto/github-repo", "Repositório GitHub (Código)", "GitHub Repo: northwind-data-pipeline", "https://github.com/Gads1208", 0.34),
    ]
    contacts = [
        ("/contato/linkedin", "Clique: LinkedIn", "LinkedIn (Guilherme Antunes)", "https://linkedin.com/in/guilherme-antunes-206031235/", 0.28),
        ("/contato/github", "Perfil GitHub (Gads1208)", "GitHub: Gads1208", "https://github.com/Gads1208", 0.22),
        ("/contato/whatsapp", "Clique: WhatsApp", "WhatsApp Direto", "https://wa.me/5532999984457", 0.12),
        ("/contato/email", "Clique: E-mail", "E-mail (gads1208@gmail.com)", "mailto:gads1208@gmail.com", 0.09),
    ]

    rng = random.Random(42)
    rows = []
    idx = 1000

    for v in range(visitors_count):
        visitor_id = f"vis_demo_{v + 1:03d}"
        # Cada visitante faz entre 1 e 2 sessões
        num_sessions = 2 if rng.random() < 0.22 else 1

        # Escolha ponderada de source e device
        r_src = rng.random()
        acc = 0.0
        chosen_source, chosen_ref = sources[0][0], sources[0][1]
        for s_name, s_ref, weight in sources:
            acc += weight
            if r_src <= acc:
                chosen_source, chosen_ref = s_name, s_ref
                break

        r_dev = rng.random()
        acc = 0.0
        dev, os_name, browser, screen = devices[0][0], devices[0][1], devices[0][2], devices[0][3]
        for d_type, d_os, d_br, d_sc, weight in devices:
            acc += weight
            if r_dev <= acc:
                dev, os_name, browser, screen = d_type, d_os, d_br, d_sc
                break

        for s in range(num_sessions):
            session_id = f"sess_demo_{v + 1:03d}_{s + 1}"
            # Mais visitas nos dias mais recentes
            day_offset = int((rng.random() ** 1.35) * days)
            hour_offset = rng.randint(8, 22)
            min_offset = rng.randint(0, 58)
            base_time = (
                now
                - datetime.timedelta(days=day_offset)
            ).replace(hour=hour_offset, minute=min_offset, second=rng.randint(1, 50), microsecond=0)
            if base_time > now:
                base_time = now - datetime.timedelta(minutes=rng.randint(5, 180))

            idx += 1
            rows.append((
                f"evt_demo_{idx}",
                visitor_id,
                session_id,
                "pageview",
                "/",
                "Portfólio Completo (Acesso Inicial)",
                "Portfólio Principal",
                "",
                chosen_source,
                chosen_ref,
                dev,
                os_name,
                browser,
                screen,
                0,
                1,
                base_time.isoformat().replace("+00:00", "Z"),
            ))

            # Seções visitadas na sessão
            sec_offset = 4
            for sec_id, sec_path, sec_title, prob in sections:
                if rng.random() <= prob:
                    idx += 1
                    sec_offset += rng.randint(6, 18)
                    t_sec = base_time + datetime.timedelta(seconds=sec_offset)
                    rows.append((
                        f"evt_demo_{idx}",
                        visitor_id,
                        session_id,
                        "section_view",
                        sec_path,
                        sec_title,
                        sec_id,
                        "",
                        chosen_source,
                        chosen_ref,
                        dev,
                        os_name,
                        browser,
                        screen,
                        0,
                        1,
                        t_sec.isoformat().replace("+00:00", "Z"),
                    ))

            # Cliques em projetos
            for p_path, p_title, p_target, p_url, prob in projects:
                if rng.random() <= prob:
                    idx += 1
                    sec_offset += rng.randint(8, 25)
                    t_proj = base_time + datetime.timedelta(seconds=sec_offset)
                    rows.append((
                        f"evt_demo_{idx}",
                        visitor_id,
                        session_id,
                        "project_click",
                        p_path,
                        p_title,
                        p_target,
                        p_url,
                        chosen_source,
                        chosen_ref,
                        dev,
                        os_name,
                        browser,
                        screen,
                        0,
                        1,
                        t_proj.isoformat().replace("+00:00", "Z"),
                    ))

            # Cliques em contatos
            for c_path, c_title, c_target, c_url, prob in contacts:
                if rng.random() <= prob:
                    idx += 1
                    sec_offset += rng.randint(5, 15)
                    t_cont = base_time + datetime.timedelta(seconds=sec_offset)
                    rows.append((
                        f"evt_demo_{idx}",
                        visitor_id,
                        session_id,
                        "contact_click",
                        c_path,
                        c_title,
                        c_target,
                        c_url,
                        chosen_source,
                        chosen_ref,
                        dev,
                        os_name,
                        browser,
                        screen,
                        0,
                        1,
                        t_cont.isoformat().replace("+00:00", "Z"),
                    ))

            # Duração da sessão
            idx += 1
            duration = max(25, sec_offset + rng.randint(15, 95))
            t_end = base_time + datetime.timedelta(seconds=duration)
            rows.append((
                f"evt_demo_{idx}",
                visitor_id,
                session_id,
                "session_duration",
                "/session/heartbeat",
                "Tempo de Permanência",
                "",
                "",
                chosen_source,
                chosen_ref,
                dev,
                os_name,
                browser,
                screen,
                duration,
                1,
                t_end.isoformat().replace("+00:00", "Z"),
            ))

    conn.executemany(
        """
        INSERT OR IGNORE INTO portfolio_events (
            id, visitor_id, session_id, event_type, page_path, page_title,
            target_name, target_url, source, referrer, device, os, browser,
            screen, duration_sec, is_demo, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )


class PortfolioAnalyticsHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/analytics/events":
            params = urllib.parse.parse_qs(parsed.query)
            include_demo = params.get("include_demo", ["1"])[0] != "0"
            conn = get_db_connection()
            try:
                if include_demo:
                    cur = conn.execute(
                        "SELECT * FROM portfolio_events ORDER BY timestamp DESC LIMIT 5000"
                    )
                else:
                    cur = conn.execute(
                        "SELECT * FROM portfolio_events WHERE is_demo = 0 ORDER BY timestamp DESC LIMIT 5000"
                    )
                events = [dict(row) for row in cur.fetchall()]
                cur_counts = conn.execute(
                    """
                    SELECT
                        COUNT(*) AS total,
                        SUM(CASE WHEN is_demo = 0 THEN 1 ELSE 0 END) AS real_count,
                        SUM(CASE WHEN is_demo = 1 THEN 1 ELSE 0 END) AS demo_count
                    FROM portfolio_events
                    """
                ).fetchone()
                self._send_json({
                    "status": "ok",
                    "storage": "SQLite (analytics.db)",
                    "total_stored": cur_counts["total"] or 0,
                    "real_count": cur_counts["real_count"] or 0,
                    "demo_count": cur_counts["demo_count"] or 0,
                    "events": events,
                })
            finally:
                conn.close()
            return

        if parsed.path == "/api/analytics/health":
            self._send_json({"status": "healthy", "engine": "sqlite3", "db": DB_PATH})
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"

        try:
            data = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError:
            data = {}

        if parsed.path == "/api/analytics/event":
            conn = get_db_connection()
            try:
                with conn:
                    conn.execute(
                        """
                        INSERT OR REPLACE INTO portfolio_events (
                            id, visitor_id, session_id, event_type, page_path, page_title,
                            target_name, target_url, source, referrer, device, os, browser,
                            screen, duration_sec, is_demo, timestamp
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            data.get("id") or f"evt_{int(datetime.datetime.now().timestamp() * 1000)}",
                            data.get("visitor_id", "vis_anon"),
                            data.get("session_id", "sess_anon"),
                            data.get("event_type", "pageview"),
                            data.get("page_path", "/"),
                            data.get("page_title", "Portfólio"),
                            data.get("target_name", ""),
                            data.get("target_url", ""),
                            data.get("source", "Acesso Direto"),
                            data.get("referrer", "direto"),
                            data.get("device", "Desktop"),
                            data.get("os", "Linux"),
                            data.get("browser", "Chrome"),
                            data.get("screen", "1920x1080"),
                            int(data.get("duration_sec") or 0),
                            int(data.get("is_demo") or 0),
                            data.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
                        ),
                    )
                self._send_json({"status": "recorded"})
            finally:
                conn.close()
            return

        if parsed.path == "/api/analytics/sync":
            events_list = data.get("events", [])
            conn = get_db_connection()
            inserted = 0
            try:
                with conn:
                    for ev in events_list:
                        conn.execute(
                            """
                            INSERT OR IGNORE INTO portfolio_events (
                                id, visitor_id, session_id, event_type, page_path, page_title,
                                target_name, target_url, source, referrer, device, os, browser,
                                screen, duration_sec, is_demo, timestamp
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                ev.get("id"),
                                ev.get("visitor_id", "vis_anon"),
                                ev.get("session_id", "sess_anon"),
                                ev.get("event_type", "pageview"),
                                ev.get("page_path", "/"),
                                ev.get("page_title", "Portfólio"),
                                ev.get("target_name", ""),
                                ev.get("target_url", ""),
                                ev.get("source", "Acesso Direto"),
                                ev.get("referrer", "direto"),
                                ev.get("device", "Desktop"),
                                ev.get("os", "Linux"),
                                ev.get("browser", "Chrome"),
                                ev.get("screen", "1920x1080"),
                                int(ev.get("duration_sec") or 0),
                                int(ev.get("is_demo") or 0),
                                ev.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
                            ),
                        )
                        inserted += 1
                self._send_json({"status": "synced", "processed": inserted})
            finally:
                conn.close()
            return

        if parsed.path == "/api/analytics/seed":
            conn = get_db_connection()
            try:
                with conn:
                    conn.execute("DELETE FROM portfolio_events WHERE is_demo = 1")
                    seed_demo_events(conn, days=14, visitors_count=48)
                self._send_json({"status": "seeded"})
            finally:
                conn.close()
            return

        self._send_json({"error": "Not found"}, status=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/analytics/reset":
            params = urllib.parse.parse_qs(parsed.query)
            mode = params.get("mode", ["all"])[0]
            conn = get_db_connection()
            try:
                with conn:
                    if mode == "demo_only":
                        conn.execute("DELETE FROM portfolio_events WHERE is_demo = 1")
                    else:
                        conn.execute("DELETE FROM portfolio_events")
                self._send_json({"status": "cleared", "mode": mode})
            finally:
                conn.close()
            return

        self._send_json({"error": "Not found"}, status=404)


def run_server(port=PORT):
    init_db()
    socketserver.TCPServer.allow_reuse_address = True
    for p in range(port, port + 15):
        try:
            with socketserver.TCPServer(("", p), PortfolioAnalyticsHandler) as httpd:
                print("\n=====================================================================")
                print("🚀 Portfólio & Dashboard de Acessos (SQLite Telemetry) Iniciado!")
                print(f"🌐 Portfólio Principal:    http://localhost:{p}")
                print(f"📊 Dashboard de Acessos:   http://localhost:{p}/analytics.html")
                print(f"🗄️  Banco de Dados SQLite:  {DB_PATH}")
                print("=====================================================================\n")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            raise e


if __name__ == "__main__":
    run_server()

