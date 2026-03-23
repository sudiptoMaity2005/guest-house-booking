export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            {/* Changed justify-between to justify-center to center the content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-center items-center gap-4">
                
                {/* Brand and Copyright */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 mr-2">
                        <span className="text-lg font-extrabold text-gray-950 tracking-tight">Drey</span>
                        <span className="text-lg font-extrabold text-blue-600 tracking-tight">Go</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium border-l border-gray-300 pl-4">
                        © {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}