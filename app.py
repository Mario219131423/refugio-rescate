from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refugios.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'mi_secreto'

db = SQLAlchemy(app)

# Modelo de Usuario
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Modelo de Refugio
class Refugio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    latitud = db.Column(db.Float, nullable=False)
    longitud = db.Column(db.Float, nullable=False)
    contacto = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)

# Ruta principal → Redirige al login
@app.route('/')
def index():
    return redirect(url_for('login'))

# Registro de usuarios
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        nombre = request.form['nombre']
        correo = request.form['correo']
        password = request.form['password']
        
        if Usuario.query.filter_by(correo=correo).first():
            return "Este correo ya está registrado"

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        nuevo_usuario = Usuario(nombre=nombre, correo=correo, password=hashed_password)
        db.session.add(nuevo_usuario)
        db.session.commit()
        return redirect(url_for('login'))
    
    return render_template('registro.html')

# Login de usuarios
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        correo = request.form['correo']
        password = request.form['password']
        
        usuario = Usuario.query.filter_by(correo=correo).first()
        
        if usuario and check_password_hash(usuario.password, password):
            session['usuario_id'] = usuario.id
            return redirect(url_for('dashboard'))
        else:
            return "Credenciales incorrectas"
    
    return render_template('login.html')

# Dashboard (protección de sesión)
@app.route('/dashboard')
def dashboard():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    
    refugios = Refugio.query.all()
    return render_template('dashboard.html', refugios=refugios)

# Agregar un nuevo refugio
@app.route('/agregar_refugio', methods=['POST'])
def agregar_refugio():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    
    nombre = request.form['nombre']
    latitud = request.form['latitud']
    longitud = request.form['longitud']
    contacto = request.form['contacto']
    descripcion = request.form['descripcion']
    
    nuevo_refugio = Refugio(nombre=nombre, latitud=float(latitud), longitud=float(longitud), contacto=contacto, descripcion=descripcion)
    db.session.add(nuevo_refugio)
    db.session.commit()
    
    return redirect(url_for('dashboard'))

# Eliminar refugio
@app.route('/eliminar_refugio/<int:id>')
def eliminar_refugio(id):
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    
    refugio = Refugio.query.get(id)
    if refugio:
        db.session.delete(refugio)
        db.session.commit()
    
    return redirect(url_for('dashboard'))

# Cerrar sesión
@app.route('/logout')
def logout():
    session.pop('usuario_id', None)
    return redirect(url_for('login'))

# API de refugios
@app.route('/api/refugios')
def api_refugios():
    refugios = Refugio.query.all()
    return jsonify([{
        'id': r.id, 
        'nombre': r.nombre, 
        'latitud': r.latitud, 
        'longitud': r.longitud, 
        'contacto': r.contacto, 
        'descripcion': r.descripcion
    } for r in refugios])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
