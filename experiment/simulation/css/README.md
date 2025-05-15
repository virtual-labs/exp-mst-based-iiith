# K-means Clustering Simulation CSS Documentation

This document provides an overview of the CSS styling system used in the K-means Clustering Simulation application.

## Overview

The CSS for this application follows a systematic approach using CSS custom properties (variables) to maintain consistency throughout the interface. The styling is built with a focus on:

- Design system methodology with reusable variables
- Responsive design for different screen sizes
- Accessibility considerations
- Consistent visual hierarchy and spacing

## CSS Architecture

### Design Tokens

The styling system uses a set of design tokens (CSS variables) defined at the `:root` level to maintain consistency:

#### Color System

- **Primary Colors**: Blue-purple palette (`--color-primary`, `--color-primary-light`, `--color-primary-dark`)
- **Secondary Colors**: Cyan-blue palette (`--color-secondary`, `--color-secondary-light`, `--color-secondary-dark`) 
- **Accent Colors**: Pink-magenta palette (`--color-accent`, `--color-accent-light`, `--color-accent-dark`)
- **Neutral Colors**: 10-step gray scale from light to dark (`--color-neutral-50` through `--color-neutral-900`)
- **Semantic Colors**: Success, warning, error, and info colors for status indicators
- **Cluster Colors**: 10 distinct colors for visualizing different clusters

#### Spacing System

A consistent spacing scale using `rem` units:
- `--space-xxs` (0.25rem) through `--space-xxxl` (4rem)

#### Typography

Font size scale using `rem` units:
- `--font-size-xs` (0.75rem) through `--font-size-xxxl` (2rem)

#### Other Design Tokens

- **Shadows**: 5 levels of shadow definitions
- **Border Radius**: 4 levels plus full radius
- **Transitions**: 3 timing presets

### Components

The CSS defines styling for various UI components:

#### Layout Components

- **App Container**: Main grid layout
- **Header & Footer**: Application framing elements
- **Main Content**: Two-column layout with visualization and controls
- **Panels**: Control panels with collapsible sections

#### UI Elements

- **Cards**: Info cards and statistics displays
- **Form Controls**: Inputs, sliders, checkboxes
- **Buttons**: Various button styles with states
- **Notifications**: Notification system with animations
- **Progress Indicators**: Status and progress visualization

#### Data Visualization Elements

- **Canvas Container**: Styling for the visualization area
- **Cluster Statistics**: Visual representation of clustering results
- **Tooltips**: Interactive information display

### Responsive Design

The stylesheet implements responsive breakpoints:

- **Desktop**: Full two-column layout (1200px+)
- **Tablet**: Single column with full-width panels (768px-1200px)
- **Mobile**: Simplified layout with stacked elements (below 768px)
- **Small Mobile**: Further optimizations for very small screens (below 480px)

### Accessibility Features

- **Focus Styles**: Visible focus indicators for keyboard navigation
- **Color Contrast**: Ensured adequate contrast for text readability
- **Custom Scrollbars**: Improved scrollbar visibility
- **Semantic Structure**: Clear visual hierarchy

## Usage

To modify the styling:

1. **Adjust Design Tokens**: Change values in the `:root` section to update global styling
2. **Component Modifications**: Locate the relevant component section to make specific changes
3. **Media Queries**: Add or modify responsive breakpoints as needed

## Best Practices

When extending this CSS:

- Use the existing design tokens rather than hard-coded values
- Maintain the responsive design patterns
- Follow the established naming conventions
- Test changes across different screen sizes
- Consider accessibility implications of visual changes
