<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
        <i class="bx bx-home"></i> {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-black overflow-hidden shadow-sm sm:rounded-lg">
                <div class="text-center p-6 text-white">
                    <p>Welcome to<b> XU User Portal 📚</b></p>
                </div>
            </div>
        </div>
    </div>

    <div class>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-2">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100 text-center">

                    <h3 class="text-lg font-semibold">User Information</h3>
                    <p><b>Username:</b> {{ Auth::user()->name }}</p>
                    <p><b>Email:</b> {{ Auth::user()->email }}</p>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
