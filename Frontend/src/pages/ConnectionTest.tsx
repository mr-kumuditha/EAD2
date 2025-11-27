import React, { useState } from 'react';

type TestStatus = 'idle' | 'pending' | 'success' | 'failed';

interface TestResult {
    id: string;
    name: string;
    url: string;
    status: TestStatus;
    details?: string;
    durationMs?: number;
}

const TESTS: TestResult[] = [
    {
        id: 'gateway',
        name: 'API Gateway health',
        url: 'http://localhost:8080/api/health',
        status: 'idle'
    },
    {
        id: 'gateway-auth',
        name: 'Auth Service (through gateway)',
        url: 'http://localhost:8080/api/auth/health',
        status: 'idle'
    },
    {
        id: 'auth-direct',
        name: 'Auth Service (direct port check)',
        url: 'http://localhost:8081/auth/health',
        status: 'idle'
    }
];

const ConnectionTest: React.FC = () => {
    const [tests, setTests] = useState<TestResult[]>(TESTS);

    const runTest = async (test: TestResult) => {
        setTests(prev => prev.map(item => item.id === test.id ? { ...item, status: 'pending', details: undefined, durationMs: undefined } : item));

        try {
            const started = Date.now();
            const response = await fetch(test.url, { method: 'GET' });
            const duration = Date.now() - started;

            if (!response.ok) {
                setTests(prev => prev.map(item => item.id === test.id ? {
                    ...item,
                    status: 'failed',
                    durationMs: duration,
                    details: `HTTP ${response.status}`
                } : item));
                return;
            }

            const body = await response.text();
            setTests(prev => prev.map(item => item.id === test.id ? {
                ...item,
                status: 'success',
                durationMs: duration,
                details: body || 'OK'
            } : item));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            // Browsers hide CORS details, so guide the user if we get the generic message.
            const hint = message === 'Failed to fetch' ? 'Failed to fetch (CORS or server down)' : message;
            setTests(prev => prev.map(item => item.id === test.id ? {
                ...item,
                status: 'failed',
                details: hint
            } : item));
        }
    };

    const runAll = async () => {
        for (const test of tests) {
            await runTest(test);
        }
    };

    const reset = () => setTests(TESTS);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-4 text-gray-900">Backend Connectivity Diagnostics</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Use this page to verify that the frontend can reach the API gateway and auth service. Run the tests below after starting your Spring Boot services. If a test fails, hover the status for more detail and check the terminal logs of the corresponding backend service.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={runAll} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Run All Tests
                    </button>
                    <button onClick={reset} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        Reset
                    </button>
                </div>

                <div className="space-y-4">
                    {tests.map(test => (
                        <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{test.name}</h2>
                                    <p className="text-sm text-gray-500">{test.url}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => runTest(test)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Run
                                    </button>
                                    <span
                                        className={`text-sm font-semibold px-3 py-1 rounded-full ${test.status === 'success' ? 'bg-green-100 text-green-700' : test.status === 'failed' ? 'bg-red-100 text-red-700' : test.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
                                        title={test.details}
                                    >
                                        {test.status === 'success' && `Connected${test.durationMs !== undefined ? ` • ${test.durationMs}ms` : ''}`}
                                        {test.status === 'failed' && 'Failed'}
                                        {test.status === 'pending' && 'Running...'}
                                        {test.status === 'idle' && 'Not run'}
                                    </span>
                                </div>
                            </div>
                            {test.details && (
                                <p className="mt-3 text-sm text-gray-600 break-words">
                                    Details: {test.details}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-sm text-gray-500 space-y-2">
                    <p>Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Both the API gateway (`mvn spring-boot:run` in `Backend/api-gateway`) and `auth-service` (`Backend/auth-service`) must be running.</li>
                        <li>If you see <code>Failed to fetch</code>, double-check that the service started without errors and that CORS allows <code>http://localhost:5173</code>.</li>
                        <li>Open the browser devtools Network tab while logging in or registering to inspect the exact request/response.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConnectionTest;