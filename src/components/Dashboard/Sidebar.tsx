export default function Sidebar() {
    return (
        <div className="w-64 bg-blue-300 flex flex-col ">
            {/* Logo */}
            <div className="flex items-center justify-center h-20 p-4">
                <img
                    src="/logo.png"
                    alt="El logo pa"
                    className="h-16"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1">
                <ul>
                    <li className="mb-1">
                        <a href="/dashboard"
                            className="flex items-center px-4 py-3 hover:bg-white bg-opacity-30 text-purple-900">
                            <span className="mr-3">🏠</span>
                            <span>Inicio </span>
                        </a>
                    </li>
                    <li className="mb-1">
                        <a href="/dashboard/auditoria"
                            className="flex items-center px-4 py-3 hover:bg-white bg-opacity-30 text-purple-900">
                            <span className="mr-3">📑</span>
                            <span>Auditorías</span>
                        </a>
                    </li>
                    <li className="mb-1">
                        <a href="/dashboard/modulos-capacitacion"
                            className="flex items-center px-4 py-3 text-purple-900 hover:bg-white hover:bg-opacity-20">
                            <span className="mr-3">📚</span>
                            <span>Módulos de Capacitación</span>
                        </a>
                    </li>
                    <li className="mb-1">
                        <a href="/dashboard/evaluaciones"
                            className="flex items-center px-4 py-3 text-purple-900 hover:bg-white hover:bg-opacity-20">
                            <span className="mr-3">📝</span>
                            <span>Evaluaciones</span>
                        </a>
                    </li>
                    <li className="mb-1">
                        <a href="/dashboard/soporte"
                            className="flex items-center px-4 py-3 text-purple-900 hover:bg-white hover:bg-opacity-20">
                            <span className="mr-3">🛠️</span>
                            <span>Soporte</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
