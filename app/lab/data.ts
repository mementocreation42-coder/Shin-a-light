export interface LabProject {
    slug: string;
    title: string;
    description: string;
    componentKey: string;
}

export const labProjects: LabProject[] = [
    {
        slug: 'placeholder-system',
        title: 'Placeholder System',
        description: 'This is a sample interactive component to demonstrate the Lab functionality.',
        componentKey: 'placeholder',
    },
    {
        slug: 'color-palette-generator',
        title: 'Color Palette Generator',
        description: 'A tool to generate harmonious color palettes based on HSL values.',
        componentKey: 'placeholder',
    },
    {
        slug: 'typography-scale',
        title: 'Typography Scale',
        description: 'Interactive type scale calculator for web design projects.',
        componentKey: 'placeholder',
    },
    {
        slug: 'physics-engine-demo',
        title: 'Physics Engine Demo',
        description: '2D physics simulation using Matter.js with interactive constraints.',
        componentKey: 'placeholder',
    },
    {
        slug: 'audio-visualizer',
        title: 'Audio Visualizer',
        description: 'Real-time audio frequency analysis and visualization.',
        componentKey: 'placeholder',
    },
    {
        slug: '3d-model-viewer',
        title: '3D Model Viewer',
        description: 'WebGL-based 3D model inspector with lighting controls.',
        componentKey: 'placeholder',
    },
];
