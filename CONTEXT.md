# Digital Dashboard

The Digital Dashboard is a desktop operations-monitoring module extracted from a larger administration system. It provides a monitoring-room overview and five focused dashboards while remaining portable back into the host system.

## Language

**Digital Dashboard Module (数字看板模块)**:
The complete desktop monitoring module, including its overview, focused dashboards, filters, and navigation.
_Avoid_: Digital twin, mobile dashboard

**Monitoring Room (监控室)**:
The module's overview screen, which summarizes the current state of every focused dashboard and provides navigation into them.
_Avoid_: Home page, portal, television wall

**Focused Dashboard (专项看板)**:
One operational view dedicated to line operations, AGV operations, device operations, tightening-angle control, or reliability analysis.
_Avoid_: Subpage, card detail

**Production Line (拉线)**:
A manufacturing flow made up of ordered stations and monitored as one operational unit.
_Avoid_: Route, cable, generic line

**Station (工站)**:
A named operational step on a Production Line whose state and cycle time are monitored independently.
_Avoid_: Device, node

**AGV Fleet (AGV 车队)**:
The complete set of material and personnel AGVs dispatched within the selected Production Line.
_Avoid_: Robot list, vehicle pool

**Tightening-Angle Control (拧紧角度管控)**:
The operational practice of tracking tightening-angle pass rate, deviation distribution, and prioritized optimization items.
_Avoid_: Torque monitoring, tightening report

**Reliability Analysis (可靠性分析)**:
The focused view of failure interval, repair time, downtime, availability, and fault priority for the selected Production Line.
_Avoid_: Maintenance log, alarm list
