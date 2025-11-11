exports.addUserData = (req, res, next) => {
  // Dummy user, bisa dihapus jika kamu pakai auth asli
  req.user = { id: 1, nama: "Default User" };
  next();
};

 	
exports.isAdmin = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
 	    console.log('Middleware: Izin admin diberikan.');
 	    next(); 
 	} else {
 	    console.log('Middleware: Gagal! Pengguna bukan admin.');
 	    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin'});
 	}
};
