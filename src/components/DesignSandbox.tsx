import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';

// Simple icon components for demo
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const DesignSandbox = () => {
    return (
        <div className="min-h-screen bg-primary/5 p-8 font-sans text-neutral-900">
            <div className="max-w-6xl mx-auto space-y-12">
                <section>
                    <h1 className="text-4xl font-bold mb-4 text-primary">Design System Sandbox</h1>
                    <p className="text-secondary text-lg">
                        Verification environment for the "Luxury yet Clean" visual identity.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Color Palette</h2>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary">Primary (Deep Royal Blue)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ColorCard name="primary" className="bg-primary" />
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary">Secondary (Slate) & Accent (Gold)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ColorCard name="secondary" className="bg-secondary" />
                            <ColorCard name="accent" className="bg-accent text-primary" />
                        </div>
                    </div>
                    <div className="space-y-4 mt-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary">Neutral Scale</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <ColorCard name="50" className="bg-neutral-50 border border-neutral-200" text="text-neutral-900" />
                            <ColorCard name="200" className="bg-neutral-200" text="text-neutral-900" />
                            <ColorCard name="500" className="bg-neutral-500" />
                            <ColorCard name="700" className="bg-neutral-700" />
                            <ColorCard name="900" className="bg-neutral-900" />
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary">Status Colors</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <ColorCard name="success" className="bg-success" />
                            <ColorCard name="warning" className="bg-warning" />
                            <ColorCard name="error" className="bg-error" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Typography & Hierarchy</h2>
                    <div className="bg-white rounded-lg p-8 shadow-soft space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-secondary">H1 / Inter Bold / 36px</p>
                            <h1 className="text-4xl font-bold text-primary">The Quick Brown Fox Jumps Over The Lazy Dog</h1>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-secondary">H2 / Inter Semibold / 30px</p>
                            <h2 className="text-3xl font-semibold text-primary">The Quick Brown Fox Jumps Over The Lazy Dog</h2>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-secondary">H3 / Inter SemiBold / 24px</p>
                            <h3 className="text-2xl font-semibold text-primary">The Quick Brown Fox Jumps Over The Lazy Dog</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-secondary">Body / Inter Regular / 16px</p>
                            <p className="text-base text-secondary leading-relaxed">
                                Luxury design is not about decoration; it is about the absence of friction.
                                We prioritize clarity, whitespace, and purpose in every pixel.
                                The interface should recede, allowing the user's intent to take center stage.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-secondary">Small / Inter Medium / 14px</p>
                            <p className="text-sm font-medium text-secondary">
                                STARTING FROM $1,200.00
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Glassmorphism & Shadows</h2>
                    <div className="relative h-64 w-full bg-gradient-to-br from-primary to-neutral-900 rounded-xl flex items-center justify-center overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-secondary/30 rounded-full blur-3xl"></div>

                        <div className="glass p-8 rounded-2xl text-center max-w-sm mx-4">
                            <h3 className="text-xl font-bold text-white mb-2">Glass Card</h3>
                            <p className="text-white/80 text-sm">
                                This card uses the `.glass` utility featuring backdrop blur,
                                semi-transparent white background, and a subtle border.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Button Component</h2>

                    {/* Variants */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary mb-4">Variants</h3>
                        <div className="flex flex-wrap gap-4 p-8 bg-white rounded-lg shadow-soft">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary mb-4">Sizes</h3>
                        <div className="flex flex-wrap items-center gap-4 p-8 bg-white rounded-lg shadow-soft">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>

                    {/* States */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary mb-4">States</h3>
                        <div className="flex flex-wrap items-center gap-4 p-8 bg-white rounded-lg shadow-soft">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button isLoading>Loading</Button>
                        </div>
                    </div>

                    {/* With Icons */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-secondary mb-4">With Icons</h3>
                        <div className="flex flex-wrap items-center gap-4 p-8 bg-white rounded-lg shadow-soft">
                            <Button leftIcon={<PlusIcon />}>Add Item</Button>
                            <Button rightIcon={<ArrowRightIcon />}>Continue</Button>
                            <Button leftIcon={<PlusIcon />} rightIcon={<ArrowRightIcon />}>Both Icons</Button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Card Component</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Default Variant */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-neutral-600">
                                    This is the default card variant with a clean white background,
                                    subtle shadow, and neutral border.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm">Learn More</Button>
                            </CardFooter>
                        </Card>

                        {/* Glass Variant */}
                        <div className="relative bg-gradient-to-br from-primary to-neutral-900 rounded-xl p-4">
                            <Card variant="glass">
                                <CardHeader className="border-white/10">
                                    <CardTitle className="text-white">Glass Card</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80">
                                        The glass variant features backdrop blur and
                                        semi-transparent styling.
                                    </p>
                                </CardContent>
                                <CardFooter className="bg-transparent border-white/10">
                                    <Button variant="secondary" size="sm" className="border-white/50 text-white">
                                        Action
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const ColorCard = ({ name, className, text = 'text-white' }: { name: string, className: string, text?: string }) => (
    <div className={`p-4 rounded-lg shadow-sm flex flex-col justify-end h-24 ${className}`}>
        <span className={`text-xs font-bold uppercase ${text}`}>{name}</span>
    </div>
);

export default DesignSandbox;
