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
];
