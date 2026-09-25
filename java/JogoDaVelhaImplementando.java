import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
import java.awt.BorderLayout;
import java.util.Random;

public class JogoDaVelhaImplementando extends JFrame {

	ImageIcon iconCirculo = new ImageIcon(getClass().getResource("/partePrincipal/bola.png"));
	ImageIcon iconX = new ImageIcon(getClass().getResource("/partePrincipal/x.png"));

	JPanel pTela = new JPanel(new GridLayout(3, 3, 10, 10));

	Bloco[] blocos = new Bloco[9];

	// private int[][] winCombinations = { { 1, 2, 3 }, { 1, 4, 7 }, { 1, 5, 9 }, {
	// 2, 5, 8 }, { 3, 6, 9 }, { 3, 5, 7 },{ 4, 5, 6 }, { 7, 8, 9 } };

	int rodadas = 0;
	private String namePadraoPlayer1 = "Jogador 1";
	private String namePadraoPlayer2 = "Jogador 2";
	final int JOGADOR_1 = 1;
	final int JOGADOR_2 = 2;
	int jogadorVez = JOGADOR_1;
	static int contraquem;

	JLabel lInformacao = new JLabel(namePadraoPlayer1);

	public JogoDaVelhaImplementando() {
		boolean resp = retornapergunta("Voce deseja Jogar contra Alguem ou Sozinho?", "Player Vs Player",
				"Player Vs Pc");
		if (resp) {
			configurarJanela();
			configurarTela();
			// Contra player
			contraquem = 0;
		} else {
			configurarJanela();
			configurarTela();
			// Contra Maquina
			contraquem = 1;

		}

	}

	public void configurarTela() {
		for (int i = 0; i < 9; i++) {
			Bloco bloco = new Bloco();
			blocos[i] = bloco;
			pTela.add(bloco);
		}
		JMenuBar menuBar = new JMenuBar();
		setJMenuBar(menuBar);

		JMenu mnNewMenu = new JMenu("Options");
		menuBar.add(mnNewMenu);

		JMenu mnNewMenu_1 = new JMenu("Change Name");
		mnNewMenu.add(mnNewMenu_1);

		JButton btnNewButton = new JButton("Jogador 1");
		btnNewButton.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				namePadraoPlayer1 = retornaString("Insina o nome do jogador 1");
				if (jogadorVez == 1) {
					lInformacao.setText(namePadraoPlayer1);
				}
			}
		});
		JButton btnNewButton_1 = new JButton("Jogador 2");
		btnNewButton_1.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				namePadraoPlayer2 = retornaString("Insina o nome do jogador 2");
				if (jogadorVez == 2) {

					lInformacao.setText(namePadraoPlayer2);
				}
			}
		});
		mnNewMenu_1.add(btnNewButton);
		mnNewMenu_1.add(btnNewButton_1);
		add(BorderLayout.CENTER, pTela);
		add(BorderLayout.NORTH, lInformacao);
		lInformacao.setBackground(Color.black);
		lInformacao.setFont(new Font("Arial", Font.BOLD, 35));
		lInformacao.setForeground(new Color(50, 200, 50));
		lInformacao.setHorizontalAlignment(SwingConstants.CENTER);
	}

	public void mudarVez(int jogador) {
		if (jogadorVez == 1) {
			jogadorVez = 2;
			lInformacao.setText(namePadraoPlayer2);
			lInformacao.setForeground(Color.RED);
		} else {
			jogadorVez = 1;
			lInformacao.setText(namePadraoPlayer1);
			lInformacao.setForeground(new Color(50, 200, 50));
		}
	}

	public boolean testarVitoria() {
		return true;
	}

	public void configurarJanela() {
		setTitle("Jogo da Velha");
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		setSize(650, 600);
		setLocationRelativeTo(null);
		setVisible(true);
		setJMenuBar(new JMenuBar() {

		});
	}

	public static void main(String[] args) {
		new JogoDaVelhaImplementando();
		if (contraquem == 1) {
		} else {

		}
	}

	public class Bloco extends JButton {
		int quem = 0;

		public Bloco() {
			setBackground(Color.LIGHT_GRAY);
			addActionListener(e -> {
				// setando player contra PC
				if (contraquem == 0) {
					if (getIcon() == null) {
						mudarVez(jogadorVez);
					} else {
						JOptionPane.showMessageDialog(null, "Movimento Indisponivel !", "Confirme que entendeu !",
								JOptionPane.WARNING_MESSAGE);
						return;
					}
				}
				// setando player contra player
				if (contraquem == 1) {

					if (getIcon() == null) {
					} else {
						JOptionPane.showMessageDialog(null, "Movimento Indisponivel !", "Confirme que entendeu !",
								JOptionPane.WARNING_MESSAGE);
						return;
					}
				}

			});
		}

	}

	public boolean retornapergunta(String message, String botaoTrue, String botaoFalse) {
		boolean resposta = false;
		Object[] options = { botaoTrue, botaoFalse };
		int op = JOptionPane.showOptionDialog(null, message, "Atenção", JOptionPane.DEFAULT_OPTION,
				JOptionPane.WARNING_MESSAGE, null, options, 0);
		if (op == 0) {
			return resposta = true;
		} else {
			return resposta;
		}

	}

	public void resetgame() {
		jogadorVez = JOGADOR_1;
		rodadas = 0;
		pTela.removeAll();
		dispose();
		new JogoDaVelhaImplementando();
	}

	public void verifyWinner() {

	}

	public String retornaString(String message) {
		String name = JOptionPane.showInputDialog(null, message, "Atenção", JOptionPane.WARNING_MESSAGE);
		return name;
	}

}