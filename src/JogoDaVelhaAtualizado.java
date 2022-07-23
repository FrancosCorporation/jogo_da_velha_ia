
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.Random;

import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

public class JogoDaVelhaAtualizado extends JFrame {
	ImageIcon iconCirculo = new ImageIcon(getClass().getResource("/partePrincipal/bola.png"));
	ImageIcon iconX = new ImageIcon(getClass().getResource("/partePrincipal/x.png"));

	JPanel pTela = new JPanel(new GridLayout(3, 3, 10, 10));

	Bloco[] blocos = new Bloco[9];

	// private int[][] winCombinations = { { 1, 2, 3 }, { 1, 4, 7 }, { 1, 5, 9 }, {
	// 2, 5, 8 }, { 3, 6, 9 }, { 3, 5, 7 },{ 4, 5, 6 }, { 7, 8, 9 } };

	int rodadas = 0;

	final int JOGADOR_1 = 1;
	final int JOGADOR_2 = 2;

	int jogadorVez = JOGADOR_1;
	static int contra = 1;

	JLabel lInformacao = new JLabel("Jogador " + JOGADOR_1);

	public JogoDaVelhaAtualizado() {
		boolean resp = retornapergunta("Voce deseja Jogar contra Alguem ou Sozinho?", "Player Vs Player",
		"Player Vs Pc");
		if (resp) {
			configurarJanela();
			configurarTela();
			contra = 1;
		} else {
			configurarJanela();
			configurarTela();
			contra = 2;

		}

	}

	public void configurarTela() {
		for (int i = 0; i < 9; i++) {
			Bloco bloco = new Bloco();
			blocos[i] = bloco;
			pTela.add(bloco);
		}
		add(BorderLayout.CENTER, pTela);
		add(BorderLayout.NORTH, lInformacao);
		lInformacao.setBackground(Color.black);
		lInformacao.setFont(new Font("Arial", Font.BOLD, 35));
		lInformacao.setForeground(new Color(50, 200, 50));
		lInformacao.setHorizontalAlignment(SwingConstants.CENTER);
	}

	public void mudarVez() {
		if (jogadorVez == 1) {
			jogadorVez = 2;
			lInformacao.setText("Jogador 2");
			lInformacao.setForeground(Color.RED);
		} else {
			jogadorVez = 1;
			lInformacao.setText("Jogador 1");
			lInformacao.setForeground(new Color(50, 200, 50));
		}
	}

	public boolean testarVitoria(int jog) {
		if (blocos[0].quem == jog && blocos[1].quem == jog && blocos[2].quem == jog) {
			return true;
		}
		if (blocos[3].quem == jog && blocos[4].quem == jog && blocos[5].quem == jog) {
			return true;
		}
		if (blocos[6].quem == jog && blocos[7].quem == jog && blocos[8].quem == jog) {
			return true;
		}
		if (blocos[0].quem == jog && blocos[3].quem == jog && blocos[6].quem == jog) {
			return true;
		}
		if (blocos[1].quem == jog && blocos[4].quem == jog && blocos[7].quem == jog) {
			return true;
		}
		if (blocos[2].quem == jog && blocos[5].quem == jog && blocos[8].quem == jog) {
			return true;
		}
		if (blocos[0].quem == jog && blocos[4].quem == jog && blocos[8].quem == jog) {
			return true;
		}
		if (blocos[2].quem == jog && blocos[4].quem == jog && blocos[6].quem == jog) {
			return true;
		}
		return false;
	}

	public void configurarJanela() {
		setTitle("Jogo da Velha");
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		setSize(650, 600);
		setLocationRelativeTo(null);
		setVisible(true);
	}

	public static void main(String[] args) {
		new JogoDaVelhaAtualizado();
		if (contra == 2) {
		} else {

		}
	}

	public class Bloco extends JButton {
		int quem = 0;

		public Bloco() {
			setBackground(Color.CYAN);
			addActionListener(e -> {
				//setando player contra PC
				if (contra == 1) {
					if (getIcon() == null) {
						if (quem == 0) {
							if (jogadorVez == JOGADOR_1) {
								setIcon(iconCirculo);
								quem = JOGADOR_1;
							} else {
								setIcon(iconX);
								quem = JOGADOR_2;
							}
							mudarVez();
							if (testarVitoria(quem)) {
								boolean resp = retornapergunta("Jogador " + quem + " Venceu!", "Restart", "Sair");
								if (resp) {
									resetgame();

								} else {
									System.exit(0);
								}
							}
						}

						rodadas++;
						if (rodadas >= 9) {
							boolean resp = retornapergunta("Deu velha!", "Restart", "Sair");
							if (resp) {
								resetgame();
							} else {
								System.exit(0);
							}
						}
					} else {
						JOptionPane.showMessageDialog(null, "Movimento Indisponivel !", "Confirme que entendeu !",
								JOptionPane.WARNING_MESSAGE);
						return;
					}
				}
				//setando player contra player
				if (contra == 2) {

					if (getIcon() == null) {
						quem = JOGADOR_1;
						setIcon(iconCirculo);
						if (testarVitoria(JOGADOR_1)) {
							boolean resp = retornapergunta("Jogador " + quem + " Venceu!", "Restart", "Sair");
							if (resp) {
								setIcon(null);
								resetgame();

							} else {
								System.exit(0);
							}
						}
						inteligenciaAtificial();
						if (testarVitoria(JOGADOR_2)) {
							boolean resp = retornapergunta("Jogador " + JOGADOR_2 + " Venceu!", "Restart", "Sair");
							if (resp) {
								setIcon(null);
								resetgame();

							} else {
								System.exit(0);
							}
						}
						rodadas++;

						if (rodadas >= 9) {
							boolean resp = retornapergunta("Deu velha!", "Restart", "Sair");
							if (resp) {
								if (quem == JOGADOR_1) {
									setIcon(null);
									mudarVez();
								}
								resetgame();
							} else {
								System.exit(0);
							}
						}
						
					}
					else {
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
		new JogoDaVelhaAtualizado();
	}

	public int inteligenciaAtificial() {
		rodadas++;
		if (rodadas >= 9) {
			boolean resp = retornapergunta("Deu velha!", "Restart", "Sair");
			if (resp) {
				resetgame();

			} else {
				System.exit(0);
			}
		}
		if (blocos[0].quem == JOGADOR_2 && blocos[1].quem == JOGADOR_2 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
		} else if (blocos[5].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[3].quem == JOGADOR_1
				&& blocos[1].getIcon() == null) {
			blocos[1].quem = JOGADOR_2;
			blocos[1].setIcon(iconX);
			return 0;
		} else if (blocos[3].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[5].quem == JOGADOR_1
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
		} else if (blocos[1].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[7].getIcon() == null) {
			blocos[7].quem = JOGADOR_2;
			blocos[7].setIcon(iconX);
			return 0;
		} else if (blocos[6].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
		} else if (blocos[3].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[1].quem == JOGADOR_1
				&& blocos[7].getIcon() == null) {
			blocos[7].quem = JOGADOR_2;
			blocos[7].setIcon(iconX);
			return 0;
		} else if (blocos[3].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[5].quem == JOGADOR_1
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
		} else if (blocos[8].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
		} else if (blocos[2].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
		} else if (blocos[7].quem == JOGADOR_2 && blocos[8].quem == JOGADOR_2 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_2 && blocos[3].quem == JOGADOR_2 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
		} else if (blocos[6].quem == JOGADOR_2 && blocos[7].quem == JOGADOR_2 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
		} else if (blocos[6].quem == JOGADOR_2 && blocos[8].quem == JOGADOR_2 && blocos[7].getIcon() == null) {
			blocos[7].quem = JOGADOR_2;
			blocos[7].setIcon(iconX);
			return 0;
		} else if (blocos[1].quem == JOGADOR_2 && blocos[2].quem == JOGADOR_2 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_2 && blocos[2].quem == JOGADOR_2 && blocos[1].getIcon() == null) {
			blocos[1].quem = JOGADOR_2;
			blocos[1].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_1 && blocos[1].quem == JOGADOR_1 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			// setando icone quando clicado no primeiro e segundo quadrante
			return 0;
		} else if (blocos[3].quem == JOGADOR_2 && blocos[4].quem == JOGADOR_2 && blocos[5].getIcon() == null) {
			blocos[5].quem = JOGADOR_2;
			blocos[5].setIcon(iconX);
			return 0;
		} else if (blocos[4].quem == JOGADOR_2 && blocos[5].quem == JOGADOR_2 && blocos[3].getIcon() == null) {
			blocos[3].quem = JOGADOR_2;
			blocos[3].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_2 && blocos[6].quem == JOGADOR_2 && blocos[3].getIcon() == null) {
			blocos[3].quem = JOGADOR_2;
			blocos[3].setIcon(iconX);
			return 0;
		} else if (blocos[0].quem == JOGADOR_1 && blocos[2].quem == JOGADOR_1 && blocos[1].getIcon() == null) {
			blocos[1].quem = JOGADOR_2;
			blocos[1].setIcon(iconX);
			return 0;
		} else if (blocos[1].quem == JOGADOR_1 && blocos[2].quem == JOGADOR_1 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
		} else if (blocos[4].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[3].getIcon() == null) {
			blocos[3].quem = JOGADOR_2;
			blocos[3].setIcon(iconX);
			// setando icone quando clicado no quarto e quinto quadrante
			return 0;
		} else if (blocos[3].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[5].getIcon() == null) {
			blocos[5].quem = JOGADOR_2;
			blocos[5].setIcon(iconX);
			return 0;
			// setando icone quando clicado no terceiro e quarto quadrante
		} else if (blocos[6].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// setando icone quando clicado no sexto e setimo quadrante
		} else if (blocos[7].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// setando icone quando clicado no setimo e oitavo quadrante
		}
		if (blocos[0].quem == JOGADOR_1 && blocos[3].quem == JOGADOR_1 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// setando icone quando clicado no zero e terceiro quadrante
		} else if (blocos[3].quem == JOGADOR_1 && blocos[6].quem == JOGADOR_1 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// setando icone quando clicado no terceiro e sexto quadrante
		} else if (blocos[1].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[7].getIcon() == null) {
			blocos[7].quem = JOGADOR_2;
			blocos[7].setIcon(iconX);
			return 0;
			// setando icone quando clicado no primeiro e quarto quadrante
		} else if (blocos[4].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[1].getIcon() == null) {
			blocos[1].quem = JOGADOR_2;
			blocos[1].setIcon(iconX);
			return 0;
			// setando icone quando clicado no quarto e setimo quadrante
		} else if (blocos[2].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// setando icone quando clicado no segundo e quinto quadrante
		} else if (blocos[5].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// setando icone quando clicado no quinto e oitavo quadrante
		} else if (blocos[6].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[7].getIcon() == null) {
			blocos[7].quem = JOGADOR_2;
			blocos[7].setIcon(iconX);
			return 0;
			// setando icone quando clicado no sexto e oitavo quadrante
		} else if (blocos[2].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[5].getIcon() == null) {
			blocos[5].quem = JOGADOR_2;
			blocos[5].setIcon(iconX);
			return 0;
			// setando icone quando clicado no segundo e oitavo quadrante
		} else if (blocos[0].quem == JOGADOR_1 && blocos[6].quem == JOGADOR_1 && blocos[3].getIcon() == null) {
			blocos[3].quem = JOGADOR_2;
			blocos[3].setIcon(iconX);
			return 0;
			// setando icone quando clicado no zero e sexto quadrante
		} else if (blocos[0].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[2].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[8].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[6].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_1 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[1].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[1].quem == JOGADOR_1 && blocos[3].quem == JOGADOR_1 && blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[3].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[5].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[1].quem == JOGADOR_1 && blocos[3].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1
				&& blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[1].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[6].quem == JOGADOR_1
				&& blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[0].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[2].quem == JOGADOR_1 && blocos[3].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1
				&& blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[0].quem == JOGADOR_1 && blocos[2].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1
				&& blocos[3].getIcon() == null) {
			blocos[3].quem = JOGADOR_2;
			blocos[3].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[6].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[1].quem == JOGADOR_1
				&& blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[3].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[4].quem == JOGADOR_1 && blocos[8].quem == JOGADOR_1 && blocos[0].quem == JOGADOR_2
				&& blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[0].quem == JOGADOR_1 && blocos[5].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[6].getIcon() == null) {
			blocos[6].quem = JOGADOR_2;
			blocos[6].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[0].quem == JOGADOR_2 && blocos[3].quem == JOGADOR_1 && blocos[6].quem == JOGADOR_1
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[8].quem == JOGADOR_1 && blocos[1].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[2].getIcon() == null) {
			blocos[2].quem = JOGADOR_2;
			blocos[2].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[2].quem == JOGADOR_1 && blocos[7].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[8].getIcon() == null) {
			blocos[8].quem = JOGADOR_2;
			blocos[8].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[2].quem == JOGADOR_1 && blocos[6].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[5].getIcon() == null) {
			blocos[5].quem = JOGADOR_2;
			blocos[5].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[2].quem == JOGADOR_1 && blocos[3].quem == JOGADOR_1 && blocos[4].quem == JOGADOR_2
				&& blocos[0].getIcon() == null) {
			blocos[0].quem = JOGADOR_2;
			blocos[0].setIcon(iconX);
			return 0;
			// diagonal
		} else if (blocos[4].quem != JOGADOR_1 && blocos[4].getIcon() == null) {
			blocos[4].quem = JOGADOR_2;
			blocos[4].setIcon(iconX);
			return 0;
			// setando o meio se o usuario clicar nas laterais
		} else if (blocos[4].getIcon() == iconCirculo) {
			Random nr = new Random();
			int n = nr.nextInt(9);
			if (n % 2 != 0) {
				n -= 1;
			}
			if (n == 4) {
				n = 0;
			}
			blocos[n].quem = JOGADOR_2;
			blocos[n].setIcon(iconX);

			return 0;
		}
		return 0;
	}

}