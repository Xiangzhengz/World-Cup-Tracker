#!/usr/bin/env python3
"""
Shorooq World Cup Tracker - Daily Auto-Updater

This script:
1. Runs the World Cup news search workflow
2. Extracts match results and team updates
3. Automatically updates the HTML dashboard
4. Can be scheduled to run daily via cron

Usage:
  python update-world-cup-tracker.py

Schedule daily at 8 AM:
  crontab -e
  0 8 * * * cd ~/Desktop/CLAUDE\ CODE && python3 update-world-cup-tracker.py
"""

import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
HTML_FILE = SCRIPT_DIR / "shorooq-world-cup-tracker.html"
WORKFLOW_SCRIPT = Path.home() / ".claude/projects/-Users-zengxiangzheng-Desktop-CLAUDE-CODE/084a2522-a3e7-4f73-8c7d-ea5904afb0d3/workflows/scripts/world-cup-daily-tracker-wf_1737a333-98d.js"

def run_workflow():
    """Run the World Cup news search workflow via Claude Code CLI."""
    print("🔍 Searching for latest World Cup results...")

    today = datetime.now().strftime("%B %d, %Y")

    # Run workflow via Claude Code CLI
    try:
        # Note: This assumes you have claude-code CLI available
        # Adjust the command based on your setup
        cmd = [
            "claude-code",
            "workflow",
            "run",
            str(WORKFLOW_SCRIPT),
            "--args", json.dumps({"date": today})
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            print(f"❌ Workflow failed: {result.stderr}")
            return None

        # Parse workflow output
        output = json.loads(result.stdout)
        return output

    except FileNotFoundError:
        print("⚠️  Claude Code CLI not found. Using mock data for demo.")
        # For demo purposes, return mock data structure
        return {
            "updated": False,
            "reason": "Claude Code CLI not configured. Run workflow manually in Claude Code."
        }
    except Exception as e:
        print(f"❌ Error running workflow: {e}")
        return None


def update_html(workflow_result):
    """Update the HTML dashboard with workflow results."""

    if not workflow_result or not workflow_result.get("updated"):
        print(f"ℹ️  No updates to apply: {workflow_result.get('reason', 'Unknown')}")
        return False

    participant_updates = workflow_result.get("participant_updates", [])
    updates_feed = workflow_result.get("updates_feed", [])
    date = workflow_result.get("date", datetime.now().strftime("%B %d, %Y"))

    if not participant_updates:
        print("ℹ️  No participant updates found.")
        return False

    print(f"\n📊 Applying {len(participant_updates)} participant updates...")

    # Read current HTML
    html_content = HTML_FILE.read_text(encoding='utf-8')

    # Extract current PARTICIPANTS array
    participants_match = re.search(
        r'const PARTICIPANTS = \[([\s\S]*?)\];',
        html_content
    )

    if not participants_match:
        print("❌ Could not find PARTICIPANTS array in HTML")
        return False

    # Parse current participants
    participants = []
    participant_lines = [
        line for line in participants_match.group(1).split('\n')
        if 'initials:' in line
    ]

    for line in participant_lines:
        initials_match = re.search(r"initials: '([^']+)'", line)
        country_match = re.search(r"country: '([^']+)'", line)
        flag_match = re.search(r"flag: '([^']+)'", line)
        status_match = re.search(r"status: '([^']+)'", line)
        stage_match = re.search(r"stage: '([^']+)'", line)
        wins_match = re.search(r'wins: (\d+)', line)
        losses_match = re.search(r'losses: (\d+)', line)

        if initials_match:
            participants.append({
                'initials': initials_match.group(1),
                'country': country_match.group(1) if country_match else '',
                'flag': flag_match.group(1) if flag_match else '',
                'status': status_match.group(1) if status_match else 'in',
                'stage': stage_match.group(1) if stage_match else 'group',
                'wins': int(wins_match.group(1)) if wins_match else 0,
                'losses': int(losses_match.group(1)) if losses_match else 0
            })

    # Apply updates
    for update in participant_updates:
        participant = next(
            (p for p in participants if p['initials'] == update['initials']),
            None
        )

        if participant:
            if update.get('wins_delta'):
                participant['wins'] += update['wins_delta']
            if update.get('losses_delta'):
                participant['losses'] += update['losses_delta']
            if update.get('new_stage'):
                participant['stage'] = update['new_stage']
            if update.get('new_status'):
                participant['status'] = update['new_status']

            print(f"  ✅ {update['initials']} ({update['country']}): "
                  f"W{participant['wins']}-L{participant['losses']}, "
                  f"{participant['stage']}, {participant['status']}")

    # Rebuild PARTICIPANTS array
    new_participants_lines = [
        f"      {{ initials: '{p['initials']}', country: '{p['country']}', "
        f"flag: '{p['flag']}', status: '{p['status']}', stage: '{p['stage']}', "
        f"wins: {p['wins']}, losses: {p['losses']} }}"
        for p in participants
    ]

    new_participants_block = (
        "const PARTICIPANTS = [\n" +
        ",\n".join(new_participants_lines) +
        "\n    ];"
    )

    # Replace PARTICIPANTS in HTML
    html_content = re.sub(
        r'const PARTICIPANTS = \[[\s\S]*?\];',
        new_participants_block,
        html_content
    )

    # Update UPDATES feed
    updates_match = re.search(r'const UPDATES = \[([\s\S]*?)\];', html_content)
    if updates_match and updates_feed:
        # Build new updates
        new_updates_lines = [
            f"      {{ text: '{u['text']}', time: '{u['time']}', type: '{u['type']}' }}"
            for u in updates_feed[:3]  # Keep top 3 new updates
        ]

        # Keep existing updates (limit to 2 old ones)
        existing_lines = [
            line.strip() for line in updates_match.group(1).split('\n')
            if 'text:' in line
        ][:2]

        all_updates = new_updates_lines + existing_lines
        new_updates_block = (
            "const UPDATES = [\n" +
            ",\n".join(all_updates) +
            "\n    ];"
        )

        html_content = re.sub(
            r'const UPDATES = \[[\s\S]*?\];',
            new_updates_block,
            html_content
        )

    # Update timestamps
    html_content = re.sub(
        r'Last Updated: [^<]+',
        f'Last Updated: {date}',
        html_content
    )
    html_content = re.sub(
        r'Generated [^<]+',
        f'Generated {date}',
        html_content
    )

    # Write updated HTML
    HTML_FILE.write_text(html_content, encoding='utf-8')

    print(f"\n✅ Dashboard updated successfully!")
    print(f"📄 Updated file: {HTML_FILE}")
    print(f"📰 Added {len(updates_feed)} news updates")

    return True


def main():
    print("=" * 60)
    print("🏆 Shorooq World Cup Tracker - Daily Auto-Updater")
    print("=" * 60)
    print()

    # Check if HTML file exists
    if not HTML_FILE.exists():
        print(f"❌ HTML file not found: {HTML_FILE}")
        sys.exit(1)

    # Run workflow
    workflow_result = run_workflow()

    if workflow_result is None:
        print("❌ Failed to get workflow results")
        sys.exit(1)

    # Update HTML
    success = update_html(workflow_result)

    if success:
        print("\n🎉 World Cup tracker updated! Open the HTML file to view.")
        sys.exit(0)
    else:
        print("\n⚠️  No changes made to the dashboard.")
        sys.exit(0)


if __name__ == "__main__":
    main()
