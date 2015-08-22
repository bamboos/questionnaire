<?php

namespace AppBundle\Controller;

use AppBundle\Data\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', array(
            'base_dir' => realpath($this->container->getParameter('kernel.root_dir').'/..'),
        ));
    }

    /**
     * @Route("/login", name="login")
     *
     * @param Request $request
     */
    public function loginAction(Request $request)
    {
        return new JsonResponse([
            'success' => false,
            'message' => 'Login plese'
        ]);
    }

    /**
     * This is the route the login form submits to.
     *
     * But, this will never be executed. Symfony will intercept this first
     * and handle the login automatically. See form_login in app/config/security.yml
     *
     * @Route("/login_check", name="security_login_check")
     */
    public function loginCheckAction()
    {

    }

    /**
     * @Route("/profile", name="profile")
     */
    public function profileAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
            throw $this->createAccessDeniedException();
        }

        $user = $this->get('security.token_storage')->getToken()->getUser();

        return new JsonResponse([
            'user' => $user->getUsername()
        ]);
    }

    /**
     * @Route("/categories", name="categories_list")
     */
    public function categoriesAction(Request $request)
    {
        $dataManager = new Manager('Category');

        return new JsonResponse($dataManager->retrieveAll());
    }
}
