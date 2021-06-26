<header class="main-header " id="header">
    <nav class="navbar navbar-static-top navbar-expand-lg">
        <!-- Sidebar toggle button -->
        <button id="sidebar-toggler" class="sidebar-toggle">
            <span class="sr-only">Toggle navigation</span>
        </button>
        <!-- search form -->
        <div class="search-form d-none d-lg-inline-block"></div>

        <div class="navbar-right ">
            <ul class="nav navbar-nav">
                <!-- User Account -->
                <li class="dropdown user-menu">
                    <button href="#" class="dropdown-toggle nav-link" data-toggle="dropdown">
                        <span class="d-none d-lg-inline-block">{{auth()->user()->full_name}}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right">
                        <!-- User image -->
                        <li class="dropdown-header">
                            <div class="d-inline-block">
                                {{auth()->user()->full_name}} <small class="pt-1">{{auth()->user()->email}}</small>
                            </div>
                        </li>

                        <li>
                            <a href="{{route('admin.password.index')}}">
                                <i class="mdi mdi-account"> </i>@lang('artist::user.change_password')
                            </a>
                        </li>
                        <li class="dropdown-footer">
                            <form id="logout-form" action="{{ route('artist.logout') }}" method="POST" style="display: none;">
                                @csrf
                            </form>
                            <a onclick="event.preventDefault();document.getElementById('logout-form').submit();" href="{{ route('artist.logout') }}" >
                                <i class="mdi mdi-logout"></i>
                                @lang('artist::auth.logout')
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>


</header>
