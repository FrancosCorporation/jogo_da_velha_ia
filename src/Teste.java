import javax.swing.BorderFactory;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JFrame;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.Rectangle;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.border.BevelBorder;
import javax.swing.border.TitledBorder;

public class Teste extends JFrame implements ActionListener{

	private static final long serialVersionUID = 1L;
	private JPanel jContentPane = null;
	static JPanel jPanelTabuleiro = null;
	private JLabel jbtTitulo = null;
	private JLabel jlbSubTitulo = null;
	 
	private int[][] winCombinations = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 },
	{ 1, 4, 7 }, { 2, 5, 8 }, { 3, 6, 9 }, { 1, 5, 9 }, { 3, 5, 7 } };
	 
	private static JButton[] buttons = new JButton[10];
	private int counts = 0;
	private boolean wins = false;
	String result;
	// private String winner;
	private String player = null;
	private static int vizero = 0;
	private static int inzero = 0;
	private static int egall = 0;
	private static int vix = 0;
	private static int inx = 0;
	private int[] copie_tabla = new int[10];
	private JLabel jlbSite = null;
	private JButton jlbLogo = null;
	 
	private JPanel getJPanelTabuleiro() {
	if (jPanelTabuleiro == null) {
	jPanelTabuleiro = new JPanel();
	jPanelTabuleiro.setLayout(null);
	jPanelTabuleiro.setBounds(new Rectangle(167, 101, 500, 500));
	// jPanelTabuleiro.setPreferredSize(new Dimension(500, 500));
	jPanelTabuleiro.setLayout(new GridLayout(3, 3));
	jPanelTabuleiro.setVisible(true);
	jPanelTabuleiro.setBorder(BorderFactory.createTitledBorder(
	BorderFactory.createBevelBorder(BevelBorder.LOWERED),
	"Tabuleiro", TitledBorder.CENTER,
	TitledBorder.DEFAULT_POSITION, new Font("Arial", Font.BOLD,
	18), new Color(30, 144, 255)));
	}
	return jPanelTabuleiro;
	}
	 
	private JButton getJlbLogo() {
	if (jlbLogo == null) {
	//ImageIcon imagen = new ImageIcon(getClass().getResource("/imagens/MALBATAHAN.png"));
	jlbLogo = new JButton();
	jlbLogo.setToolTipText("Informações");
	jlbLogo.setCursor(new Cursor(Cursor.HAND_CURSOR));
	jlbLogo.setBounds(new Rectangle(699, 2, 97, 101));
	jlbLogo.addActionListener(new java.awt.event.ActionListener() {
	public void actionPerformed(java.awt.event.ActionEvent e) {
	JOptionPane
	.showMessageDialog(
	null,
	"Este jogo foi implementado com o algoritmo minimax, ou seja, usando inteligência artificial. "
	+ "\n\n Em teoria da decisão, o minimax (ou minmax) é um método para minimizar a perda máxima possível. "
	+ "\n Pode ser considerado como a maximização do ganho mínimo (maximin). "
	+ "\n Começa-se com dois jogadores 0-0 da teoria dos jogos, cobrindo ambos os casos em que os jogadores tomam caminhos alternados (por rodadas) ou simultaneamente. "
	+ "\n Pode-se estender o conceito para jogos mais complexos e para tomada de decisão na presença de incertezas. "
	+ "\n Nesse caso não existe outro jogador, as consequências das decisões dependem de fatores desconhecidos."
	+ "\n Uma versão simples do algoritmo minimax lida com jogos como o jogo da velha, no qual cada jogador pode ganhar, perder ou empatar. "
	+ "\n\n - Wikipédia",
	"Jogo Da Velha - J. Marcos B.",
	JOptionPane.INFORMATION_MESSAGE);
	}
	});
	}
	return jlbLogo;
	}
	 
	public static void main(String[] args) {
	SwingUtilities.invokeLater(new Runnable() {
	public void run() {
		Teste thisClass = new Teste();
	thisClass.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	thisClass.setVisible(true);
	 
	}
	});
	}
	 
	public Teste() {
	super();
	initialize();
	 
	for (int i = 1; i <= 9; i++) {
	buttons[i] = new JButton();
	buttons[i].setFont(new Font("Arial", Font.BOLD, 72));
	buttons[i].setText("");
	buttons[i].setCursor(new Cursor(Cursor.HAND_CURSOR));
	jPanelTabuleiro.add(buttons[i]);
	buttons[i].addActionListener(this);
	}
	 
	}
	 
	private void initialize() {
	this.setSize(806, 668);
	this.setContentPane(getJContentPane());
	this.setTitle("Jogo Da Velha - J. Marcos B.");
	// Tamanho fixo do programa, sem alteção
	this.setResizable(false);
	// Deixa o programa no meio da tela, centralizado
	this.setLocationRelativeTo(null);
	}
	 
	private JPanel getJContentPane() {
	if (jContentPane == null) {
	 
	jlbSite = new JLabel();
	jlbSite.setBounds(new Rectangle(326, 611, 186, 20));
	jlbSite.setHorizontalAlignment(SwingConstants.CENTER);
	jlbSite.setText("https://isjavado.wordpress.com");
	jlbSite.setCursor(new Cursor(Cursor.HAND_CURSOR));
	jlbSite.setToolTipText("Visite o blog");
	jlbSite.setForeground(Color.BLUE);
	
	 
	jlbSubTitulo = new JLabel();
	jlbSubTitulo.setBounds(new Rectangle(89, 48, 643, 20));
	jlbSubTitulo.setHorizontalAlignment(SwingConstants.CENTER);
	jlbSubTitulo.setForeground(Color.red);
	jlbSubTitulo.setText("Humano vs Computador (MiniMax AI)");
	 
	jbtTitulo = new JLabel();
	jbtTitulo.setBounds(new Rectangle(88, 5, 643, 40));
	jbtTitulo.setHorizontalAlignment(SwingConstants.CENTER);
	jbtTitulo.setFont(new Font("Arial", Font.BOLD, 38));
	jbtTitulo.setForeground(new Color(0, 0, 204));
	jbtTitulo.setText("Jogo Da Velha");
	 
	jContentPane = new JPanel();
	jContentPane.setLayout(null);
	jContentPane.add(getJPanelTabuleiro(), null);
	jContentPane.add(jbtTitulo, null);
	jContentPane.add(jlbSubTitulo, null);
	jContentPane.add(jlbSite, null);
	jContentPane.add(getJlbLogo(), null);
	}
	return jContentPane;
	}
	 
	public static void reset_score(ActionEvent evt) {
	vizero = (inzero = egall = 0);
	vix = (inx = 0);
	}
	 
	public void actionPerformed(ActionEvent a) {
	JButton pressedButton = (JButton) a.getSource();
	 
	if (pressedButton.getText().equals("")) {
	pressedButton.setText("X");
	pressedButton.setForeground(Color.blue);
	copie_tabla = copie_tabla();
	counts += 1;
	checkWin();
	 
	int poz_max = min_max(copie_tabla);
	 
	buttons[poz_max].setText("O");
	buttons[poz_max].setForeground(Color.red);
	counts += 1;
	checkWin();
	} else {
	Toolkit.getDefaultToolkit().beep();
	JOptionPane.showMessageDialog(null, "Escolha outro movimento!!!!",
	"Jogo Da Velha ", JOptionPane.ERROR_MESSAGE);
	 
	}
	}
	 
	public int[] poz_lib_cp(int[] cop) {
	int bb = 0;
	int[] poz_0 = new int[10];
	for (int b = 1; b <= 9; b++) {
	if (cop[b] == 0) {
	bb++;
	poz_0[bb] = b;
	}
	}
	return poz_0;
	}
	 
	public int[] copie_tabla() {
	int[] tabla = new int[10];
	 
	for (int cas = 1; cas <= 9; cas++)
	if (buttons[cas].getText().equals("X")) {
	tabla[cas] = 1;
	} else if (buttons[cas].getText().equals("O")) {
	tabla[cas] = 2;
	} else {
	tabla[cas] = 0;
	}
	return tabla;
	}
	 
	@SuppressWarnings("unused")
	public int table_winner(int[] cc) {
	int rez = -1;
	int zero = 0;
	String winn = "";
	boolean game_over = false;
	 
	for (int i = 0; i <= 7; i++) {
	if ((cc[winCombinations[i][0]] == 1)
	&& (cc[winCombinations[i][0]] == cc[winCombinations[i][1]])
	&& (cc[winCombinations[i][1]] == cc[winCombinations[i][2]])
	&& (cc[winCombinations[i][0]] != 0)) {
	game_over = true;
	winn = "X";
	rez = -1000000;
	}
	 
	if ((cc[winCombinations[i][0]] != 2)
	|| (cc[winCombinations[i][0]] != cc[winCombinations[i][1]])
	|| (cc[winCombinations[i][1]] != cc[winCombinations[i][2]])
	|| (cc[winCombinations[i][0]] == 0)) {
	continue;
	}
	game_over = true;
	winn = "O";
	rez = 1000000;
	}
	 
	for (int c = 1; c <= 9; c++) {
	if (cc[c] != 0) {
	zero++;
	}
	}
	 
	if ((zero >= 9) && (!game_over)) {
	winn = "Empate";
	rez = 0;
	}
	 
	return rez;
	}
	 
	public void display_winner(int vinn, int infrang, int egal, String tex) {
	if (JOptionPane.showConfirmDialog(null, vinn + " Vitórias  ," + egal
	+ "  Empates ," + infrang + "  Derrotas\n" + "Jogar de novo?",
	tex, 0) != 0) {
	 
	// zerando os botões
	for (int i = 1; i <= 9; i++) {
	buttons[i].setText("");
	copie_tabla[i] = 0;
	}// fim do for zerando os botões
	 
	} else
	newgame();
	}
	 
	public void newgame() {
	counts = 0;
	wins = false;
	result = "";
	 
	for (int i = 1; i <= 9; i++) {
	buttons[i].setText("");
	copie_tabla[i] = 0;
	}
	}
	 
	// Metodo de AI
	public int min_max(int[] board) {
	int bestval = -1000000;
	int index = 0;
	int[] best_move = new int[10];
	int[] p_lib = new int[10];
	p_lib = poz_lib_cp(board);
	int nr_poz = 0;
	 
	for (int cc = 1; cc <= 9; cc++) {
	if (p_lib[cc] > 0) {
	nr_poz++;
	}
	}
	 
	int nr = 1;
	while (nr <= nr_poz) {
	int mut = p_lib[nr];
	board[mut] = 2;
	 
	int val = MinMove(board);
	if (val > bestval) {
	bestval = val;
	index = 0;
	best_move[index] = mut;
	} else if (val == bestval) {
	index++;
	best_move[index] = mut;
	}
	board[mut] = 0;
	nr++;
	}
	 
	int r = 0;
	if (index > 0) {
	Random x = new Random();
	r = x.nextInt(index);
	}
	return best_move[r];
	}
	 
	public int MinMove(int[] board) {
	int pos_value = table_winner(board);
	 
	if (pos_value != -1) {
	return pos_value;
	}
	 
	int best_val = 1000000;
	int[] p_lib = new int[10];
	p_lib = poz_lib_cp(board);
	int nr_poz = 0;
	for (int cc = 1; cc <= 9; cc++) {
	if (p_lib[cc] > 0) {
	nr_poz++;
	}
	}
	int nr = 1;
	while (nr <= nr_poz) {
	int mut = p_lib[nr];
	board[mut] = 1;
	int val = MaxMove(board);
	if (val < best_val) {
	best_val = val;
	}
	board[mut] = 0;
	nr++;
	}
	return best_val;
	}
	 
	public int MaxMove(int[] board) {
	int pos_value = table_winner(board);
	 
	if (pos_value != -1) {
	return pos_value;
	}
	int best_val = -1000000;
	int[] p_lib = new int[10];
	p_lib = poz_lib_cp(board);
	int nr_poz = 0;
	for (int cc = 1; cc <= 9; cc++) {
	if (p_lib[cc] > 0) {
	nr_poz++;
	}
	}
	int nr = 1;
	 
	while (nr <= nr_poz) {
	int mut = p_lib[nr];
	board[mut] = 2;
	int val = MinMove(board);
	if (val > best_val) {
	best_val = val;
	}
	 
	board[mut] = 0;
	nr++;
	}
	return best_val;
	}
	 
	// Metodo Checar vencedor
	public void checkWin() {
	int nr = 0;
	wins = false;
	 
	for (int i = 0; i <= 7; i++) {
	if ((buttons[winCombinations[i][0]].getText().equals("X"))
	&& (buttons[winCombinations[i][0]].getText()
	.equals(buttons[winCombinations[i][1]].getText()))
	&& (buttons[winCombinations[i][1]].getText()
	.equals(buttons[winCombinations[i][2]].getText()))
	&& (!buttons[winCombinations[i][0]].getText().equals(""))) {
	player = "X";
	wins = true;
	}
	 
	if ((!buttons[winCombinations[i][0]].getText().equals("O"))
	|| (!buttons[winCombinations[i][0]].getText().equals(
	buttons[winCombinations[i][1]].getText()))
	|| (!buttons[winCombinations[i][1]].getText().equals(
	buttons[winCombinations[i][2]].getText()))
	|| (buttons[winCombinations[i][0]].getText().equals(""))) {
	continue;
	}
	player = "O";
	wins = true;
	}
	 
	for (int c = 1; c <= 9; c++) {
	if ((buttons[c].getText().equals("X"))
	|| (buttons[c].getText().equals("O"))) {
	nr++;
	}
	}
	if (wins == true) {
	if (player == "X") {
	vix += 1;
	inzero += 1;
	result = "X Ganhou o jogo!!!";
	display_winner(vix, inx, egall, result);
	}
	 
	if (player == "O") {
	vizero += 1;
	inx += 1;
	result = "O Ganhou o jogo!!!";
	display_winner(vizero, inzero, egall, result);
	}
	}
	 
	if ((nr == 9) && (counts >= 9) && (!wins)) {
	egall += 1;
	result = "Jogo empatado!!!";
	 
	if (JOptionPane.showConfirmDialog(null, egall + " Empates\n"
	+ "Jogar de novo?", result, 0) != 0) {
	// window.dispose();
	} else
	newgame();
	}
	}
	

}