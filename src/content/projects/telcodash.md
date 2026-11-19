---
title: Telcodash
numeral: 320
kind: shortlist
order: 4
repository: telcodash/core
related:
  - camwhi-te/teledash-contracts

# Yours to write. Each empty value renders as a ruled blank.
summary: "A fully-featured management stack for a telecommunications provider featuring simulated customer/billing accounts, MSISDN/SIM management and team management with RBAC."
role: "Software Engineer"
period: "November 2026 - May 2027"
---
For my dissertation project, I'm building Telcodash - an all-in-one management suite for a telco provider which features simulations for all types of consumer or business management.

The "core" houses essential data like employee login info and RBAC assignments to ensure users can interact with the right components at the right time. Functions hand off to the Queue, which is a distributed worker which takes a JSON payload from Core and routes it through to the appropriate "Daemon" (see diagram above.)

The project is open-source on GitHub and is still in continued development. It mainly features TypeScript with Bun frameworks, using SQLite for persistent memory and Redis for on-the-fly caching of results and information. All data transmission is done through private networking over encrypted tunnels and all elements of the stack are containerised and composed with Docker for distributed high-availability deployments on any machine.