# Product Requirements Document (PRD)

## Elevator Pitch

This tool is designed to help teams using Autosys manage complex job dependencies and workflows. It provides a graph-based visualization for job hierarchies, highlights runtime failures, and allows users to drill down into detailed job metrics. Additionally, it integrates a Gantt chart to visualize job execution timelines, enabling better decision-making and issue resolution.

## Who is this app for

This app is targeted at teams and operations engineers using Autosys to manage large-scale job workflows. It's especially valuable for organizations that need to track job execution, identify bottlenecks, and resolve issues quickly across complex job dependencies.

## Functional Requirements

- **Graph-Based Visualization**: Use D3.js to display job hierarchies and dependencies.
- **Drill-Down Navigation**: Enable users to filter and view jobs by component type or activity set.
- **Runtime Failure Highlighting**: Highlight failed job nodes and their dependencies.
- **Performance Metrics**: Display maximum wait time and runtime for each job node.
- **Gantt Chart**: Provide a Gantt chart showing job start times, durations, and dependencies.
- **Dependency Impact**: Visualize how failures propagate to dependent jobs.

## User Stories

- As a user, I want to see a clear hierarchy of job dependencies, so I can understand how jobs relate to each other.
- As a user, I want to be able to drill down and filter jobs by component type or activity set, so I can focus on specific areas.
- As a user, I want to quickly identify failed jobs in the system, so I can resolve issues faster.
- As a user, I want to see key performance metrics like maximum wait time and runtime for each job, so I can optimize job execution.
- As a user, I want to view job execution in a Gantt chart format, so I can easily track their progress and identify delays.

## User Interface

- **Main Screen**: The main screen will feature a graph visualization of job dependencies. Jobs will be represented as nodes, and dependencies will be connected with directed edges. Failed nodes will be highlighted in a distinct color.
- **Filters**: Users can use dropdowns or checkboxes to filter jobs by component type or activity set.
- **Performance Metrics Display**: A side panel will show metrics like maximum wait time and runtime for selected jobs.
- **Gantt Chart**: The Gantt chart will be placed beneath the graph visualization, displaying job execution timelines in bar format, with clear color coding for status.
