import React from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Notific } from '@/utils/Notification';
const Header: React.FC = () => {
	const router = useRouter();
	const handleLogout = () => {
		Notific.confirm('ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?', async () => {
			localStorage.clear();
			router.push('/login');
		})
	}
	return (
		<>
			<div id="header" className="app-header">
				<div className="navbar-header">
					<Link href={'/'} className="navbar-brand text-white"><img src="../assets/img/logo/PLC.png" className="navbar-logo bg-white rounded-3" /> <b className="me-3px">PLC</b> Stock </Link>
					<button type="button" className="navbar-mobile-toggler" data-toggle="app-sidebar-mobile">
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
					</button>
				</div>
				<div className="navbar-nav">
					<div className="navbar-item navbar-form">
						<form method="POST" name="search">
							<div className="form-group">
								<input type="text" className="form-control" placeholder="Enter keyword" />
								<button type="submit" className="btn btn-search"><i className="fa fa-search"></i></button>
							</div>
						</form>
					</div>
					<div className="navbar-item dropdown">
						<a href="javascript:void(0)" data-bs-toggle="dropdown" className="navbar-link dropdown-toggle icon">
							<i className="fa fa-bell"></i>
							<span className="badge">5</span>
						</a>
						<div className="dropdown-menu media-list dropdown-menu-end">
							<div className="dropdown-header">NOTIFICATIONS (5)</div>
							<a href="javascript:void(0)" className="dropdown-item media">
								<div className="media-left">
									<i className="fa fa-bug media-object bg-gray-500"></i>
								</div>
								<div className="media-body">
									<h6 className="media-heading">Server Error Reports <i className="fa fa-exclamation-circle text-danger"></i></h6>
									<div className="text-muted fs-10px">3 minutes ago</div>
								</div>
							</a>
							<a href="javascript:void(0)" className="dropdown-item media">
								<div className="media-left">
									<img src="null" className="media-object" alt="image" />
									<i className="fab fa-facebook-messenger text-blue media-object-icon"></i>
								</div>
								<div className="media-body">
									<h6 className="media-heading">John Smith</h6>
									<p>Quisque pulvinar tellus sit amet sem scelerisque tincidunt.</p>
									<div className="text-muted fs-10px">25 minutes ago</div>
								</div>
							</a>
							<div className="dropdown-footer text-center">
								<a href="javascript:void(0)" className="text-decoration-none">View more</a>
							</div>
						</div>
					</div>

					<div className="navbar-item navbar-user dropdown">
						<a href="javascript:void(0)" className="navbar-link dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
							<img src="../assets/img/icon/icon-user.jpg" alt="image" />
							<span>
								<span className="d-none d-md-inline">Adam Schwartz</span>
								<b className="caret"></b>
							</span>
						</a>
						<div className="dropdown-menu dropdown-menu-end px-2 me-1">
							<Link href="/profile" className="dropdown-item bg-blue text-white fs-6 rounded-4"> <i className="fa-solid fa-user" /> ຂໍ້ມູນໂປຣໄຟລ໌</Link>
							<div className="dropdown-divider"></div>
							<a href='javascript:void(0)' onClick={handleLogout} className="dropdown-item bg-orange text-white fs-6 rounded-4"><i className="fa-solid fa-right-from-bracket" /> Log Out</a>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Header