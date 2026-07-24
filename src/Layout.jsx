{user?.role === 'admin' && (
                <NavLink to="/admin" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
                  Admin Panel
                </NavLink>
              )}