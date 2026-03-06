import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import Lotofacil from "./pages/lotofacil";
import MegaSena from "./pages/megasena";
import Quina from "./pages/quina";
import Timemania from "./pages/timemania";
import DiaDeSorte from "./pages/dia-de-sorte";
import SuperSete from "./pages/super-sete";
import DuplaSena from "./pages/dupla-sena";
import Lotomania from "./pages/lotomania";
import Federal from "./pages/federal";
import Internacional from "./pages/internacional";
import ComoFunciona from "./pages/como-funciona";
import PorQueBolaoMax from "./pages/por-que-bolaomax";
import PerguntasFrequentes from "./pages/perguntas-frequentes";
import ConteudoEducativo from "./pages/conteudo-educativo";
import Transparencia from "./pages/transparencia";
import SobreNos from "./pages/sobre-nos";
import TermosDeUso from "./pages/termos-de-uso";
import PoliticaReembolso from "./pages/politica-reembolso";
import PoliticaCookies from "./pages/politica-cookies";
import Compliance from "./pages/compliance";
import MapaDoSite from "./pages/mapa-do-site";
import Suporte from "./pages/suporte";
import PoliticaPrivacidade from "./pages/politica-privacidade";
import Checkout from "./pages/checkout";
import MinhaConta from "./pages/minha-conta";
import PagamentoPix from "./pages/pagamento-pix";
import Resultados from "./pages/resultados";
import Calendar from "./pages/calendar";
import ClientIndicacoes from "./pages/client/indicacoes";
import ClubeVIP from "./pages/clube-vip";
import AdminDashboard from "./pages/admin/index";
import AdminBoloes from "./pages/admin/boloes";
import AdminBoloesEspeciais from "./pages/admin/boloes-especiais";
import AdminUsuarios from "./pages/admin/usuarios";
import AdminAssinantes from "./pages/admin/assinantes";
import AdminPlanosVIP from "./pages/admin/planos-vip";
import AdminFinanceiro from "./pages/admin/financeiro";
import AdminSaques from "./pages/admin/saques";
import AdminConfiguracoes from "./pages/admin/configuracoes";
import AdminIndicacoes from "./pages/admin/indicacoes";
import AdminAuditoria from "./pages/admin/auditoria";
import AdminRedesSociais from "./pages/admin/redes-sociais";
import AdminAutomacaoVIP from "./pages/admin/automacao-vip";
import AdminDepoimentos from "./pages/admin/depoimentos";
import AdminBlog from "./pages/admin/blog";
import AdminSEOAudit from "./pages/admin/seo-audit";
import AdminLoterias from "./pages/admin/loterias";
import AdminCalendario from "./pages/admin/calendario";
import AdminSubUsuarios from "./pages/admin/sub-usuarios";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import TestePaginas from "./pages/teste-paginas";
import Diagnostico from "./pages/diagnostico";
import Nav from "./pages/nav";
import { Provider } from "./components/provider";
import { CookieConsent } from "./components/CookieConsent";

function App() {
        return (
                <Provider>
                        <Switch>
                                <Route path="/" component={Index} />
                                <Route path="/login" component={Login} />
                                <Route path="/cadastro" component={Cadastro} />
                                {/* Lottery Routes */}
                                <Route path="/lotofacil" component={Lotofacil} />
                                <Route path="/megasena" component={MegaSena} />
                                <Route path="/quina" component={Quina} />
                                <Route path="/timemania" component={Timemania} />
                                <Route path="/dia-de-sorte" component={DiaDeSorte} />
                                <Route path="/super-sete" component={SuperSete} />
                                <Route path="/dupla-sena" component={DuplaSena} />
                                <Route path="/lotomania" component={Lotomania} />
                                <Route path="/federal" component={Federal} />
                                <Route path="/internacional" component={Internacional} />
                                {/* Info Pages */}
                                <Route path="/como-funciona" component={ComoFunciona} />
                                <Route path="/por-que-bolaomax" component={PorQueBolaoMax} />
                                <Route path="/perguntas-frequentes" component={PerguntasFrequentes} />
                                <Route path="/conteudo-educativo" component={ConteudoEducativo} />
                                <Route path="/transparencia" component={Transparencia} />
                                <Route path="/sobre-nos" component={SobreNos} />
                                {/* Legal Pages */}
                                <Route path="/termos-de-uso" component={TermosDeUso} />
                                <Route path="/politica-reembolso" component={PoliticaReembolso} />
                                <Route path="/politica-cookies" component={PoliticaCookies} />
                                <Route path="/politica-privacidade" component={PoliticaPrivacidade} />
                                <Route path="/compliance" component={Compliance} />
                                <Route path="/mapa-do-site" component={MapaDoSite} />
                                <Route path="/suporte" component={Suporte} />
                                <Route path="/contato" component={Suporte} />
                                {/* User Routes */}
                                <Route path="/checkout" component={Checkout} />
                                <Route path="/minha-conta" component={MinhaConta} />
                                <Route path="/pagamento-pix" component={PagamentoPix} />
                                <Route path="/resultados" component={Resultados} />
                                <Route path="/calendar" component={Calendar} />
                                <Route path="/calendario" component={Calendar} />
                                <Route path="/indicacoes" component={ClientIndicacoes} />
                                <Route path="/clube-vip" component={ClubeVIP} />
                                {/* Blog Routes */}
                                <Route path="/blog" component={Blog} />
                                <Route path="/blog/:slug" component={BlogPost} />
                                {/* Admin Routes */}
                                <Route path="/admin" component={AdminDashboard} />
                                <Route path="/admin/boloes" component={AdminBoloes} />
                                <Route path="/admin/boloes-especiais" component={AdminBoloesEspeciais} />
                                <Route path="/admin/loterias" component={AdminLoterias} />
                                <Route path="/admin/usuarios" component={AdminUsuarios} />
                                <Route path="/admin/assinantes" component={AdminAssinantes} />
                                <Route path="/admin/planos-vip" component={AdminPlanosVIP} />
                                <Route path="/admin/financeiro" component={AdminFinanceiro} />
                                <Route path="/admin/saques" component={AdminSaques} />
                                <Route path="/admin/configuracoes" component={AdminConfiguracoes} />
                                <Route path="/admin/indicacoes" component={AdminIndicacoes} />
                                <Route path="/admin/auditoria" component={AdminAuditoria} />
                                <Route path="/admin/redes-sociais" component={AdminRedesSociais} />
                                <Route path="/admin/automacao-vip" component={AdminAutomacaoVIP} />
                                <Route path="/admin/depoimentos" component={AdminDepoimentos} />
                                <Route path="/admin/blog" component={AdminBlog} />
                                <Route path="/admin/seo-audit" component={AdminSEOAudit} />
                                <Route path="/admin/calendario" component={AdminCalendario} />
                                <Route path="/admin/sub-usuarios" component={AdminSubUsuarios} />
                                {/* Development/Test Routes */}
                                <Route path="/teste-paginas" component={TestePaginas} />
                                <Route path="/diagnostico" component={Diagnostico} />
                                <Route path="/nav" component={Nav} />
                        </Switch>
                        <CookieConsent />
                </Provider>
        );
}

export default App;
